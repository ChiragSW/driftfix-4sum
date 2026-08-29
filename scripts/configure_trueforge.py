"""Create or update DriftFix resources in a local TrueForge instance."""

from __future__ import annotations

import json
import os
import sys
from collections.abc import Mapping
from urllib.parse import urlsplit

import httpx


REPOSITORY_URL = "https://github.com/rounakkm/driftfix-4sum.git"
SKILL_REF = "chirag"


def _service_url(value: str, name: str, *, loopback_only: bool = False) -> str:
    parsed = urlsplit(value)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError(f"{name} must be an http(s) URL")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError(f"{name} must not contain credentials, a query, or a fragment")
    if loopback_only and parsed.hostname not in {"localhost", "127.0.0.1", "::1"}:
        raise ValueError(f"{name} must point to this machine")
    return value.rstrip("/")


def _agent_manifest() -> dict[str, object]:
    return {
        "model": {"name": "codex-local/codex-subscription"},
        "instructions": (
            "You are DriftFix, an API migration agent. Load the driftfix skill and use "
            "official migration evidence before editing code. Ask an Impact Scout and a "
            "Migration Reviewer to check the change. Run the unpatched and patched tests "
            "in the TrueForge sandbox. Work only on a new branch, never push directly to "
            "main, and present sources, diff, and test evidence before creating a draft PR. "
            "Never merge without explicit human approval."
        ),
        "mcp_servers": [
            {
                "name": "driftfix-mcp",
                "enable_tools": ["@read-only"],
                "preload_tools": ["analyze_stripe_python_upgrade"],
                "require_approval_for_tools": [],
                "preload": False,
            },
            {
                "name": "github",
                "enable_tools": ["@all"],
                "preload_tools": [
                    "create_branch",
                    "push_files",
                    "create_pull_request",
                ],
                "require_approval_for_tools": ["merge_pull_request"],
                "preload": False,
            },
        ],
        "skills": [{"name": "driftfix"}],
        "config": {
            "sandbox": {"enabled": True, "file_downloads": True},
            "generative_ui": {"enabled": False},
            "ask_user_questions": {"enabled": True},
            "dynamic_sub_agents": {"enabled": True},
            "iteration_limit": 30,
        },
    }


def configure(client: httpx.Client, env: Mapping[str, str]) -> dict[str, object]:
    """Apply manifests and return a secret-free summary."""
    provider_url = _service_url(
        env.get("CODEX_PROVIDER_BASE_URL", "http://127.0.0.1:8765/v1"),
        "CODEX_PROVIDER_BASE_URL",
    )
    mcp_url = _service_url(
        env.get("DRIFTFIX_MCP_URL", "http://127.0.0.1:8000/mcp"),
        "DRIFTFIX_MCP_URL",
    )
    configured: list[str] = []

    resources = [
        (
            "/api/v1/settings/model-providers",
            {
                "type": "custom",
                "name": "codex-local",
                "base_url": provider_url,
                "models": [
                    {
                        "model_id": "codex-subscription",
                        "name": "codex-subscription",
                        "properties": {},
                    }
                ],
            },
            "model provider",
        ),
        (
            "/api/v1/settings/mcp-servers",
            {
                "type": "remote",
                "name": "driftfix-mcp",
                "url": mcp_url,
                "description": "Read-only Stripe Python migration evidence from DriftFix.",
            },
            "DriftFix MCP",
        ),
        (
            "/api/v1/settings/skills",
            {
                "type": "git",
                "name": "driftfix",
                "url": REPOSITORY_URL,
                "ref": SKILL_REF,
                "path": "agent",
                "description": "Safely migrate Stripe Python with official evidence and tests.",
            },
            "DriftFix skill",
        ),
    ]
    for endpoint, manifest, label in resources:
        response = client.put(endpoint, json={"manifest": manifest})
        response.raise_for_status()
        configured.append(label)

    missing: list[str] = []
    github_token = env.get("GITHUB_TOKEN")
    if github_token:
        response = client.put(
            "/api/v1/settings/mcp-servers",
            json={
                "manifest": {
                    "type": "remote",
                    "name": "github",
                    "url": "https://api.githubcopilot.com/mcp/",
                    "description": "GitHub repository and pull-request tools.",
                    "auth": {
                        "type": "header",
                        "headers": {"Authorization": f"Bearer {github_token}"},
                    },
                }
            },
        )
        response.raise_for_status()
        configured.append("GitHub MCP")
    else:
        missing.append("GITHUB_TOKEN")

    daytona_key = env.get("DAYTONA_API_KEY")
    if daytona_key:
        response = client.put(
            "/api/v1/settings/sandbox-providers",
            json={
                "manifest": {
                    "type": "daytona",
                    "auth": {"api_key": daytona_key},
                    "exec_timeout_ms": 60_000,
                    "auto_stop_interval_in_minutes": 5,
                    "auto_archive_interval_in_minutes": 60,
                    "auto_delete_interval_in_minutes": 7_200,
                }
            },
        )
        response.raise_for_status()
        configured.append("Daytona")
    else:
        missing.append("DAYTONA_API_KEY")

    if missing:
        return {"configured": configured, "agent": "skipped", "missing": missing}

    response = client.get("/api/v1/agents")
    response.raise_for_status()
    agents = response.json().get("data", [])
    existing = next((agent for agent in agents if agent.get("name") == "driftfix"), None)
    if existing:
        response = client.put(
            f"/api/v1/agents/{existing['id']}", json={"manifest": _agent_manifest()}
        )
        agent_status = "updated"
    else:
        response = client.post(
            "/api/v1/agents",
            json={"name": "driftfix", "manifest": _agent_manifest()},
        )
        agent_status = "created"
    response.raise_for_status()
    return {"configured": configured, "agent": agent_status, "missing": []}


def main() -> int:
    try:
        base_url = _service_url(
            os.getenv("TRUEFORGE_BASE_URL", "http://127.0.0.1:8790"),
            "TRUEFORGE_BASE_URL",
            loopback_only=True,
        )
        headers = {}
        if token := os.getenv("TRUEFORGE_TOKEN"):
            headers["Authorization"] = f"Bearer {token}"
        with httpx.Client(base_url=base_url, headers=headers, timeout=10) as client:
            result = configure(client, os.environ)
        print(json.dumps(result, indent=2))
        return 2 if result["missing"] else 0
    except (ValueError, httpx.HTTPError) as exc:
        print(f"TrueForge setup failed: {exc.__class__.__name__}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
