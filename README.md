# DriftFix

DriftFix turns Stripe SDK breaking changes into sourced, sandbox-tested migration pull requests. Codex supplies model reasoning through a local adapter; TrueForge owns tools, subagents, Daytona execution, session state, and human approval.

## Status

The Codex provider and DriftFix MCP connector are verified through TrueForge 0.1.4. A real harness session returned `DRIFTFIX_TRUEFORGE_OK`, emitted a traced `ask_user_question` tool call, and discovered both read-only DriftFix tools through TrueForge. See [plan.md](plan.md) for the remaining demo work.

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

## Reproduce the migration demo

The committed sample intentionally pins Stripe 14.3.0 and uses the old `StripeObject.get()` behavior:

```powershell
cd demo_target
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
.\.venv\Scripts\python.exe -m pytest -q
```

Upgrade only the demo environment to `stripe==15.5.1`; the same test fails at `customer.get("email")`. Replacing that expression with `customer.to_dict().get("email")` makes it pass. The repository keeps the outdated v14 version so DriftFix has a real migration to perform.

## TrueForge skill

Attach [`agent/SKILL.md`](agent/SKILL.md) to the saved TrueForge agent. During rehearsal, confirm the trace loads `driftfix` and shows both named subagents, Daytona commands, GitHub actions, and the merge approval pause.

## Configure TrueForge

Start the Codex provider, DriftFix MCP server, and TrueForge first. Put the GitHub and Daytona credentials only in the current shell, then run the idempotent setup:

```powershell
$env:GITHUB_TOKEN = "<token>"
$env:DAYTONA_API_KEY = "<key>"
python scripts/configure_trueforge.py
```

The script creates or updates the custom model, read-only MCP, pinned DriftFix skill, Daytona provider, GitHub connector, and saved agent. It never prints credential values and skips secret-backed resources when either variable is absent. When TrueForge runs in WSL, bind both local servers to the Windows address shown as WSL's default gateway (`uvicorn --host <address>` and `$env:DRIFTFIX_HOST = "<address>"`), then set `CODEX_PROVIDER_BASE_URL` and `DRIFTFIX_MCP_URL` to that address before running the script.

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
