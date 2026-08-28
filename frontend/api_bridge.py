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
