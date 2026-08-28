import sys
import os
from pathlib import Path

# Add the root directory to sys.path so we can import src.driftfix
root_dir = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(root_dir))

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

# Import from backend
try:
    from src.driftfix.workflow import latest_stripe_python_release, analyze_stripe_python_upgrade
except ImportError as e:
    print("Could not import from src.driftfix.workflow:", e)
    sys.exit(1)

app = FastAPI(title="DriftFix Frontend Bridge")

# Allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    current_version: str

import re

class DetectVersionRequest(BaseModel):
    target: str

def _extract_stripe_version_from_text(content: str) -> str | None:
    # Look for stripe==X.Y.Z, stripe>=X.Y.Z, stripe~=X.Y.Z, stripe = "X.Y.Z", etc.
    patterns = [
        r'stripe\s*==\s*["\']?(\d+\.\d+\.\d+)["\']?',
        r'stripe\s*>=\s*["\']?(\d+\.\d+\.\d+)["\']?',
        r'stripe\s*~=\s*["\']?(\d+\.\d+\.\d+)["\']?',
        r'["\']stripe==(\d+\.\d+\.\d+)["\']',
        r'["\']stripe["\']\s*:\s*["\']\^?(\d+\.\d+\.\d+)["\']',
        r'dependencies\s*=\s*\[[^\]]*["\']stripe==(\d+\.\d+\.\d+)["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            return match.group(1)
    return None

@app.post("/api/detect-version")
async def detect_stripe_version(req: DetectVersionRequest):
    target = req.target.strip()
    if not target:
        raise HTTPException(status_code=400, detail="Target path or repo URL is required")

    # 1. Try local filesystem path relative to repo or absolute
    possible_local_paths = [
        Path(target),
        root_dir / target,
        root_dir / "demo_target" if target.lower() in ("demo", "demo_target", "sample") else None,
        Path.home() / target,
    ]

    for p in possible_local_paths:
        if p and p.exists():
            # If directory, look inside common dependency files
            if p.is_dir():
                for filename in ("pyproject.toml", "requirements.txt", "setup.py", "Pipfile"):
                    candidate_file = p / filename
                    if candidate_file.is_file():
                        try:
                            text = candidate_file.read_text(encoding="utf-8", errors="ignore")
                            ver = _extract_stripe_version_from_text(text)
                            if ver:
                                return {"detected_version": ver, "source": f"{p.name}/{filename}"}
                        except Exception:
                            continue
            elif p.is_file():
                try:
                    text = p.read_text(encoding="utf-8", errors="ignore")
                    ver = _extract_stripe_version_from_text(text)
                    if ver:
                        return {"detected_version": ver, "source": str(p)}
                except Exception:
                    pass

    # 2. Try GitHub URL or owner/repo
    gh_match = re.search(r"github\.com[/:]([\w.-]+)/([\w.-]+)", target)
    owner = repo_name = None
    if gh_match:
        owner, repo_name = gh_match.group(1), gh_match.group(2).replace(".git", "")
    elif "/" in target and not target.startswith((".", "/")):
        parts = target.split("/")
        if len(parts) == 2:
            owner, repo_name = parts[0], parts[1].replace(".git", "")

    if owner and repo_name:
        branches = ["main", "master", "chirag", "anuj"]
        filenames = ["pyproject.toml", "requirements.txt", "demo_target/pyproject.toml"]
        token = os.getenv("GITHUB_TOKEN")
        headers = {"User-Agent": "driftfix-frontend/0.1"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        async with httpx.AsyncClient(timeout=5.0) as client:
            for branch in branches:
                for fname in filenames:
                    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo_name}/{branch}/{fname}"
                    try:
                        resp = await client.get(raw_url, headers=headers)
                        if resp.status_code == 200:
                            ver = _extract_stripe_version_from_text(resp.text)
                            if ver:
                                return {"detected_version": ver, "source": f"GitHub {owner}/{repo_name} ({branch}/{fname})"}
                    except Exception:
                        continue

    raise HTTPException(status_code=404, detail="Could not automatically detect a Stripe SDK version in pyproject.toml or requirements.txt")

@app.get("/api/latest-release")
def get_latest_release():
    try:
        release = latest_stripe_python_release()
        return release
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
def analyze_upgrade(req: AnalyzeRequest):
    try:
        report = analyze_stripe_python_upgrade(req.current_version)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health():
    # Proxy to provider healthz
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get("http://127.0.0.1:8765/healthz", timeout=2.0)
            return resp.json()
    except Exception as e:
        return {"status": "error", "detail": str(e)}

if __name__ == "__main__":
    uvicorn.run("api_bridge:app", host="127.0.0.1", port=8080, reload=True)

