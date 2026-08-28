import asyncio
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import driftfix.provider as provider


def test_model_discovery_contract() -> None:
    client = TestClient(provider.app)

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


@pytest.mark.parametrize(
    ("authentication", "status_code"),
    [("signed_in", 200), ("signed_out", 503), ("timed_out", 503)],
)
def test_health_reports_authentication_state(
    monkeypatch, authentication: str, status_code: int
) -> None:
    async def fake_authentication_status(_executable: str) -> str:
        return authentication

    monkeypatch.setattr(provider, "which", lambda _name: "codex-fake")
    monkeypatch.setattr(
        provider, "_authentication_status", fake_authentication_status
    )
    response = TestClient(provider.app).get("/healthz")

    assert response.status_code == status_code
    assert response.json()["authentication"] == authentication


def test_health_reports_missing_codex(monkeypatch) -> None:
    monkeypatch.setattr(provider, "which", lambda _name: None)

    response = TestClient(provider.app).get("/healthz")

    assert response.status_code == 503
    assert response.json() == {
        "status": "unavailable",
        "codex_installed": False,
        "authentication": "unavailable",
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


def test_codex_process_uses_safe_flags_and_stdin(monkeypatch) -> None:
    captured: dict[str, object] = {}
    output = "\n".join(
        [
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
            json.dumps({"type": "turn.completed", "usage": {}}),
        ]
    ).encode()

    class FakeProcess:
        returncode = 0

        async def communicate(self, supplied_input=None):
            captured["input"] = supplied_input
            return output, b""

    async def fake_create_subprocess_exec(*args, **kwargs):
        captured["args"] = args
        captured["kwargs"] = kwargs
        captured["cwd"] = Path(kwargs["cwd"])
        captured["cwd_contents"] = list(Path(kwargs["cwd"]).iterdir())
        return FakeProcess()

    monkeypatch.setattr(provider, "which", lambda _name: "codex-fake")
    monkeypatch.setattr(
        provider.asyncio, "create_subprocess_exec", fake_create_subprocess_exec
    )

    result = asyncio.run(provider._run_codex_once("bounded prompt"))

    arguments = captured["args"]
    assert result.turn.content == "Ready"
    assert captured["input"] == b"bounded prompt"
    assert arguments[0] == "codex-fake"
    assert arguments[-1] == "-"
    assert "read-only" in arguments
    disabled = {
        arguments[index + 1]
        for index, argument in enumerate(arguments[:-1])
        if argument == "--disable"
    }
    assert {
        "plugins",
        "apps",
        "shell_tool",
        "browser_use",
        "computer_use",
        "image_generation",
        "multi_agent",
        "hooks",
    } <= disabled
    assert captured["cwd_contents"] == []
    assert not captured["cwd"].exists()


def test_child_environment_excludes_api_and_repository_secrets(monkeypatch) -> None:
    monkeypatch.setenv("OPENAI_API_KEY", "not-a-real-key")
    monkeypatch.setenv("GITHUB_TOKEN", "not-a-real-token")
    monkeypatch.setenv("DAYTONA_API_KEY", "not-a-real-key")

    child_environment = provider._child_environment()

    assert "OPENAI_API_KEY" not in child_environment
    assert "GITHUB_TOKEN" not in child_environment
    assert "DAYTONA_API_KEY" not in child_environment


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


def test_invalid_output_is_retried_once(monkeypatch) -> None:
    attempts = 0

    async def fake_run_once(_prompt: str) -> provider.CodexResult:
        nonlocal attempts
        attempts += 1
        raise provider.ProviderError(
            502, "codex_invalid_output", "Invalid structured result."
        )

    async def scenario() -> None:
        with pytest.raises(provider.ProviderError) as error:
            await provider.run_codex("prompt")
        assert error.value.code == "codex_invalid_output"

    monkeypatch.setattr(provider, "_CODEX_SLOTS", asyncio.Semaphore(2))
    monkeypatch.setattr(provider, "_run_codex_once", fake_run_once)

    asyncio.run(scenario())

    assert attempts == 2


def test_invalid_output_log_excludes_model_content(caplog) -> None:
    output = json.dumps(
        {
            "type": "item.completed",
            "item": {
                "type": "agent_message",
                "text": json.dumps(
                    {
                        "kind": "tool_calls",
                        "content": "",
                        "calls": [{"name": "exec", "arguments": "sensitive-value"}],
                    }
                ),
            },
        }
    )

    with caplog.at_level("WARNING", logger="driftfix.provider"):
        with pytest.raises(provider.ProviderError):
            provider.parse_codex_jsonl(output)

    assert "codex_output_validation_failed" in caplog.text
    assert "sensitive-value" not in caplog.text


def test_parser_normalizes_a_message_wrapped_tool_call() -> None:
    output = json.dumps(
        {
            "type": "item.completed",
            "item": {
                "type": "agent_message",
                "text": json.dumps(
                    {
                        "kind": "message",
                        "content": "I will run the harness tool.",
                        "calls": [{"name": "exec", "arguments": "{}"}],
                    }
                ),
            },
        }
    )

    result = provider.parse_codex_jsonl(output)

    assert result.turn.kind == "tool_calls"
    assert result.turn.content == ""
    assert result.turn.calls[0].name == "exec"


def test_third_codex_request_waits_for_a_slot(monkeypatch) -> None:
    entered: list[str] = []

    async def scenario() -> None:
        two_started = asyncio.Event()
        release = asyncio.Event()

        async def fake_run_once(prompt: str) -> provider.CodexResult:
            entered.append(prompt)
            if len(entered) == 2:
                two_started.set()
            await release.wait()
            return provider.CodexResult(
                turn=provider.CodexTurn(kind="message", content="Ready", calls=[]),
                usage={},
            )

        monkeypatch.setattr(provider, "_run_codex_once", fake_run_once)
        tasks = [asyncio.create_task(provider.run_codex(str(index))) for index in range(3)]
        await asyncio.wait_for(two_started.wait(), timeout=1)
        await asyncio.sleep(0)
        assert len(entered) == 2
        release.set()
        await asyncio.gather(*tasks)

    monkeypatch.setattr(provider, "_CODEX_SLOTS", asyncio.Semaphore(2))

    asyncio.run(scenario())

    assert len(entered) == 3


def test_buffered_streaming_returns_sse(monkeypatch) -> None:
    async def fake_run_codex(_prompt: str) -> provider.CodexResult:
        return provider.CodexResult(
            turn=provider.CodexTurn(kind="message", content="Hello", calls=[]),
            usage={},
        )

    monkeypatch.setattr(provider, "run_codex", fake_run_codex)
    response = TestClient(provider.app).post(
        "/v1/chat/completions",
        json={
            "model": provider.MODEL_ID,
            "messages": [{"role": "user", "content": "Hello"}],
            "stream": True,
        },
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert '"delta":{"content":"Hello"}' in response.text
    assert '"finish_reason":"stop"' in response.text
    assert response.text.endswith("data: [DONE]\n\n")


def test_buffered_streaming_preserves_tool_calls(monkeypatch) -> None:
    async def fake_run_codex(_prompt: str) -> provider.CodexResult:
        return provider.CodexResult(
            turn=provider.CodexTurn(
                kind="tool_calls",
                content="",
                calls=[provider.CodexToolCall(name="lookup", arguments='{"id":1}')],
            ),
            usage={},
        )

    monkeypatch.setattr(provider, "run_codex", fake_run_codex)
    response = TestClient(provider.app).post(
        "/v1/chat/completions",
        json={
            "model": provider.MODEL_ID,
            "messages": [{"role": "user", "content": "Look it up"}],
            "tools": [
                {
                    "type": "function",
                    "function": {"name": "lookup", "parameters": {"type": "object"}},
                }
            ],
            "stream": True,
        },
    )

    assert response.status_code == 200
    assert '"name":"lookup","arguments":"{\\"id\\":1}"' in response.text
    assert '"finish_reason":"tool_calls"' in response.text
