# DriftFix

DriftFix turns Stripe SDK breaking changes into sourced, sandbox-tested migration pull requests. Codex supplies model reasoning through a local adapter; TrueForge owns tools, subagents, Daytona execution, session state, and human approval.

## Status

The Codex provider, DriftFix MCP, GitHub connector, Daytona provider, and saved `driftfix` agent are verified through TrueForge 0.1.4. The live policy exposes both DriftFix tools as read-only and requires approval for GitHub merge. See [plan.md](plan.md) for the remaining full-flow rehearsal.

## Prerequisites

- Python 3.11+
- Node.js 22.14+
- Codex CLI authenticated with `codex login`
- TrueForge, Daytona, GitHub, and Qodo for the full demo

No OpenAI Platform API key is required.

## Safety

Codex runs read-only from an empty temporary directory and receives no GitHub, Daytona, or OpenAI API credentials. TrueForge owns every MCP, sandbox, subagent, and GitHub action; DriftFix works on a branch, requires passing tests, and never merges without human approval.

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

`demo_target` is intentionally kept on Stripe 14.3.0 and uses `StripeObject` mapping methods removed in v15. This is the fixable starting point the agent should upgrade on a new branch:

```powershell
cd demo_target
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m pip install stripe==15.6.0
.\.venv\Scripts\python.exe -m pytest -q
```

The first test run passes on v14; the dependency-only v15 upgrade then fails at `.get()`, `.keys()`, `.items()`, and `dict(stripe_object)`. A valid agent PR updates the dependency, converts Stripe objects with `to_dict()`, and returns all seven tests to green. The fixture never calls Stripe's network API.

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
$env:CODEX_PROVIDER_TIMEOUT_SECONDS = "600"
python -m uvicorn driftfix.provider:app --app-dir src --host 127.0.0.1 --port 8765
```

Set the variable in the same terminal before starting the provider. Restart the provider after changing it.
Run only one provider process on port `8765`; streaming requests send keepalives while Codex works.

Start TrueForge in another terminal:

```powershell
npx @truefoundry/trueforge@latest --port 8790
```

In TrueForge Settings -> Models, add a custom provider named `codex-local`, use base URL `http://127.0.0.1:8765/v1`, and add model `codex-subscription`. Leave the API key blank.

TrueForge 0.1.4 currently fails during database migration when launched natively on this Windows machine. The verified fallback is WSL with Node 22 and `corepack pnpm@9.15.9 dlx @truefoundry/trueforge@latest --port 8790`. In that setup, bind the provider to the Windows address reported as WSL's default gateway and use `http://<WSL_HOST_IP>:8765/v1` as the model base URL. Keep both services local.

## Verified hackathon evidence

- TrueForge session `01m14g71c8zg1fpz5fe84n2by2` found Stripe 15.6.0, ran Impact Scout and Migration Reviewer, and recorded Daytona results of 7 legacy tests passing on v14, the same 7 failing after a dependency-only v15 upgrade, and 7 migrated tests passing.
- TrueForge session `01m14gz3tg1kpbhapxpd2yxbaz` held the GitHub merge call for human approval before merging [PR #1](https://github.com/ChiragSW/driftfix-4sum/pull/1).
- Qodo reviewed the implementation, its reproducibility finding was fixed with a runnable v14 fixture, and its latest result reported zero bugs and zero rule violations.

AI-assistant disclosure: Codex supplied model reasoning through the local read-only adapter and helped implement and test this repository. TrueForge remained responsible for MCP calls, subagents, Daytona execution, GitHub actions, session state, and the human merge checkpoint.
