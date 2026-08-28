from __future__ import annotations

import json

import httpx

from scripts.configure_trueforge import configure


def test_configure_creates_complete_secret_safe_agent() -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        if request.method == "GET":
            return httpx.Response(200, json={"data": []})
        return httpx.Response(200, json={"data": {}})

    env = {"GITHUB_TOKEN": "github-secret", "DAYTONA_API_KEY": "daytona-secret"}
    with httpx.Client(
        base_url="http://127.0.0.1:8790", transport=httpx.MockTransport(handler)
    ) as client:
        result = configure(client, env)

    assert result["agent"] == "created"
    assert result["missing"] == []
    assert "github-secret" not in json.dumps(result)
    assert "daytona-secret" not in json.dumps(result)

    create = next(
        request
        for request in requests
        if request.method == "POST" and request.url.path == "/api/v1/agents"
    )
    manifest = json.loads(create.content)["manifest"]
    assert manifest["model"]["name"] == "codex-local/codex-subscription"
    assert manifest["mcp_servers"][0]["enable_tools"] == ["@read-only"]
    assert manifest["mcp_servers"][0]["require_approval_for_tools"] == []
    assert manifest["mcp_servers"][1]["require_approval_for_tools"] == [
        "merge_pull_request"
    ]
    assert manifest["config"]["dynamic_sub_agents"]["enabled"] is True
    assert manifest["config"]["iteration_limit"] == 30


def test_configure_skips_secret_backed_resources_and_agent() -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(200, json={"data": {}})

    with httpx.Client(
        base_url="http://127.0.0.1:8790", transport=httpx.MockTransport(handler)
    ) as client:
        result = configure(client, {})

    assert result == {
        "configured": ["model provider", "DriftFix MCP", "DriftFix skill"],
        "agent": "skipped",
        "missing": ["GITHUB_TOKEN", "DAYTONA_API_KEY"],
    }
    assert [(request.method, request.url.path) for request in requests] == [
        ("PUT", "/api/v1/settings/model-providers"),
        ("PUT", "/api/v1/settings/mcp-servers"),
        ("PUT", "/api/v1/settings/skills"),
    ]


def test_configure_updates_an_existing_agent() -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        if request.method == "GET":
            return httpx.Response(
                200, json={"data": [{"id": "agent-7", "name": "driftfix"}]}
            )
        return httpx.Response(200, json={"data": {}})

    with httpx.Client(
        base_url="http://127.0.0.1:8790", transport=httpx.MockTransport(handler)
    ) as client:
        result = configure(
            client, {"GITHUB_TOKEN": "token", "DAYTONA_API_KEY": "key"}
        )

    assert result["agent"] == "updated"
    assert ("PUT", "/api/v1/agents/agent-7") in [
        (request.method, request.url.path) for request in requests
    ]
    assert not any(request.method == "POST" for request in requests)
