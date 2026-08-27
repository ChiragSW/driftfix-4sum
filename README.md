# DriftFix

DriftFix turns Stripe SDK breaking changes into sourced, sandbox-tested migration pull requests. Codex supplies model reasoning through a local adapter; TrueForge owns tools, subagents, Daytona execution, session state, and human approval.

## Status

The Codex provider is implemented and verified through TrueForge 0.1.4. A real harness session returned `DRIFTFIX_TRUEFORGE_OK`, then emitted a traced `ask_user_question` tool call and paused for a client response. See [plan.md](plan.md) for the remaining backend and demo work.

## Prerequisites

- Python 3.11+
- Node.js 22.14+
- Codex CLI authenticated with `codex login`
- TrueForge, Daytona, GitHub, and Qodo for the full demo

No OpenAI Platform API key is required.

## Run the migration tools

```powershell
python -m pip install -e ".[dev]"
python -m driftfix.server
```

The Streamable HTTP endpoint is `http://127.0.0.1:8000/mcp`. In another terminal, verify its two read-only schemas with the official Inspector CLI:

```powershell
npx -y @modelcontextprotocol/inspector --cli http://127.0.0.1:8000/mcp --method tools/list --strict
```

## Run the verified model integration

Start the provider:

```powershell
python -m uvicorn driftfix.provider:app --app-dir src --host 127.0.0.1 --port 8765
```

Start TrueForge in another terminal:

```powershell
npx @truefoundry/trueforge@latest --port 8790
```

In TrueForge Settings -> Models, add a custom provider named `codex-local`, use base URL `http://127.0.0.1:8765/v1`, and add model `codex-subscription`. Leave the API key blank.

TrueForge 0.1.4 currently fails during database migration when launched natively on this Windows machine. The verified fallback is WSL with Node 22 and `corepack pnpm@9.15.9 dlx @truefoundry/trueforge@latest --port 8790`. In that setup, bind the provider to the Windows address reported as WSL's default gateway and use `http://<WSL_HOST_IP>:8765/v1` as the model base URL. Keep both services local.
