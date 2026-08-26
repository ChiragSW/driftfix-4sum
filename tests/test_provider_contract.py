import json
from pathlib import Path

from fastapi.testclient import TestClient

import driftfix.provider as provider


def test_provider_discovery_contract() -> None:
    client = TestClient(provider.app)

    assert client.get("/healthz").status_code in {200, 503}
    assert client.get("/v1/models").json() == {
        "object": "list",
        "data": [
            {
                "id": provider.MODEL_ID,
                "object": "model",
                "created": 0,
                "owned_by": "local-codex",
            }
        ],
    }


def test_codex_turn_schema_is_strict_root_object() -> None:
    schema = json.loads(
        (Path(__file__).parents[1] / "schemas" / "codex_turn.schema.json").read_text()
    )

    assert schema["type"] == "object"
    assert schema["required"] == ["kind", "content", "calls"]
    assert schema["additionalProperties"] is False
    assert schema["properties"]["calls"]["items"]["additionalProperties"] is False


def test_jsonl_parser_returns_validated_final_turn() -> None:
    output = "\n".join(
        [
            json.dumps({"type": "thread.started", "thread_id": "thread-1"}),
            json.dumps(
                {
                    "type": "item.completed",
                    "item": {
                        "type": "agent_message",
                        "text": json.dumps(
                            {"kind": "message", "content": "Ready", "calls": []}
                        ),
                    },
                }
            ),
            json.dumps(
                {
                    "type": "turn.completed",
                    "usage": {"input_tokens": 12, "output_tokens": 3},
                }
            ),
        ]
    )

    result = provider.parse_codex_jsonl(output)

    assert result.turn.content == "Ready"
    assert result.usage == {"input_tokens": 12, "output_tokens": 3}


def test_plain_chat_completion(monkeypatch) -> None:
    async def fake_run_codex(_prompt: str) -> provider.CodexResult:
        return provider.CodexResult(
            turn=provider.CodexTurn(kind="message", content="Hello", calls=[]),
            usage={"input_tokens": 5, "output_tokens": 2},
        )

    monkeypatch.setattr(provider, "run_codex", fake_run_codex)
    response = TestClient(provider.app).post(
        "/v1/chat/completions",
        json={
            "model": provider.MODEL_ID,
            "messages": [{"role": "user", "content": "Hello"}],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["choices"][0] == {
        "index": 0,
        "message": {"role": "assistant", "content": "Hello"},
        "finish_reason": "stop",
    }
    assert body["usage"] == {
        "prompt_tokens": 5,
        "completion_tokens": 2,
        "total_tokens": 7,
    }


def test_tool_call_completion(monkeypatch) -> None:
    async def fake_run_codex(_prompt: str) -> provider.CodexResult:
        return provider.CodexResult(
            turn=provider.CodexTurn(
                kind="tool_calls",
                content="",
                calls=[
                    provider.CodexToolCall(
                        name="lookup_release", arguments='{"stable":true}'
                    )
                ],
            ),
            usage={},
        )

    monkeypatch.setattr(provider, "run_codex", fake_run_codex)
    response = TestClient(provider.app).post(
        "/v1/chat/completions",
        json={
            "model": provider.MODEL_ID,
            "messages": [{"role": "user", "content": "Find the release"}],
            "tools": [
                {
                    "type": "function",
                    "function": {
                        "name": "lookup_release",
                        "parameters": {
                            "type": "object",
                            "properties": {"stable": {"type": "boolean"}},
                        },
                    },
                }
            ],
        },
    )

    assert response.status_code == 200
    choice = response.json()["choices"][0]
    assert choice["finish_reason"] == "tool_calls"
    assert choice["message"]["content"] is None
    function = choice["message"]["tool_calls"][0]["function"]
    assert function == {"name": "lookup_release", "arguments": '{"stable":true}'}


def test_unknown_tool_is_rejected(monkeypatch) -> None:
    async def fake_run_codex(_prompt: str) -> provider.CodexResult:
        return provider.CodexResult(
            turn=provider.CodexTurn(
                kind="tool_calls",
                content="",
                calls=[provider.CodexToolCall(name="not_available", arguments="{}")],
            ),
            usage={},
        )

    monkeypatch.setattr(provider, "run_codex", fake_run_codex)
    response = TestClient(provider.app).post(
        "/v1/chat/completions",
        json={
            "model": provider.MODEL_ID,
            "messages": [{"role": "user", "content": "Do something"}],
        },
    )

    assert response.status_code == 502
    assert response.json()["error"]["code"] == "unknown_tool"


def test_streaming_is_rejected_until_supported() -> None:
    response = TestClient(provider.app).post(
        "/v1/chat/completions",
        json={
            "model": provider.MODEL_ID,
            "messages": [{"role": "user", "content": "Hello"}],
            "stream": True,
        },
    )

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "streaming_not_supported"
