# DriftFix

Team: **4Sum**  
Subtitle: **Turn API breaking changes into tested migration pull requests**  
Plan status: **Approved MVP direction**  
Submission deadline: **August 31, 2026 at 12:30 AM IST** (August 30 at 8:00 PM London time)  
Internal finish target: **August 30, 2026 at 10:00 PM IST**

## 1. Product in one sentence

DriftFix finds the newest stable Stripe Python SDK release, reads Stripe's official migration guidance, locates affected code, fixes it in a sandbox, runs tests, and prepares a GitHub pull request that cannot be merged without human approval.

## 2. Locked decisions

- Backend: Python 3.11+ and LangGraph.
- Outer agent harness and interface: TrueForge.
- API provider being migrated: Stripe.
- Demo migration: `stripe-python` v14 to v15.
- Demo breaking change: `StripeObject.get()` no longer exists in v15; migrate to `to_dict().get()` or safe attribute access.
- Change source: automatically discover the latest stable `stripe-python` GitHub release and read the official changelog/migration guide.
- Repository: one public repository containing DriftFix and a tiny outdated sample project.
- Model provider: a local OpenAI-compatible Codex adapter configured as a custom provider in TrueForge.
- Codex access: ChatGPT/Codex subscription through `codex login`; no OpenAI Platform API key or API billing.
- Codex invocation: one isolated `codex exec` process for each TrueForge model turn, including TrueForge-created subagent turns.
- Sandbox: Daytona through TrueForge, not called directly by our Python code.
- GitHub behavior: create a branch and draft PR; never push directly to `main`; merging requires a human approval.
- Code-quality track: install the Qodo GitHub app and address its PR findings.
- UI: TrueForge's chat and traces. A custom frontend is not required for the submission.
- Hosting: local only.
- License: MIT.

## 3. Accounts and local authentication

DriftFix does not use an OpenAI Platform API key. A small local adapter exposes the model interface TrueForge expects and delegates each model turn to the signed-in Codex CLI. Run `codex login` once on the demo machine and verify `codex exec` before starting TrueForge.

The saved Codex login is a local credential. It must never be copied into the repository, Daytona, GitHub Actions, screenshots, logs, or the demo video. Judges who run the project must install Codex and sign in with their own eligible account.

Keep all credentials out of Git:

- Codex login: keep only in the local Codex credential store.
- Codex adapter: bind to `127.0.0.1`; it needs no external API key.
- Daytona key: store in TrueForge Settings -> Sandbox providers.
- GitHub credential: store in the TrueForge GitHub connector.
- Qodo authorization: install through GitHub.
- `.env.example` contains names only, never values.

## 4. MVP success criteria

The MVP is complete only when one recorded flow can do all of the following:

- [ ] Read the demo repository's installed Stripe version.
- [ ] Automatically discover the newest stable Stripe Python release.
- [ ] Ignore draft and prerelease versions.
- [ ] Fetch the official Stripe changelog and v15 migration guide.
- [ ] Return source URLs with every reported breaking change.
- [ ] Serve Codex through the local OpenAI-compatible adapter without an OpenAI API key.
- [ ] Show that TrueForge, not Codex, initiates the DriftFix MCP calls and subagent turns.
- [ ] Identify the demo project's incompatible `.get()` usage.
- [ ] Show a failing test after upgrading the dependency without changing the code.
- [ ] Generate the minimal code and dependency patch.
- [ ] Run the patched project in a Daytona sandbox.
- [ ] Show the same test passing after the patch.
- [ ] Create a branch and draft pull request through the GitHub connector.
- [ ] Show the changed files, test evidence, and source evidence in TrueForge.
- [ ] Show TrueForge traces for the model turn, MCP call, both subagents, Daytona execution, and approval pause.
- [ ] Refresh or reconnect once and continue the same TrueForge session.
- [ ] Pause before merge and show Allow and Deny controls.
- [ ] Leave `main` unchanged when approval is denied.
- [ ] Complete the recorded happy path in about 2 minutes 30 seconds.

## 5. Non-goals

Do not build these before submission:

- Support for APIs other than Stripe.
- Languages other than Python.
- A general OpenAPI semantic-diff engine.
- A custom frontend, authentication system, database, or hosted deployment.
- Automatic merging without approval.
- Real Stripe payments or a live Stripe secret key.
- Monitoring daemons, cron jobs, email, Slack, or notifications.
- Multi-repository organization scans.
- A fully general codemod framework.
- LangSmith, a vector database, or long-term memory.
- Ollama or another local inference model.
- Codex App Server, token-level streaming, or a persistent adapter-side conversation store before the `codex exec` MVP works.
- Direct GitHub, Daytona, MCP, or repository operations from the Codex adapter.

## 6. Architecture

```text
User
  |
  v
TrueForge chat and persistent session
  |
  +-- Custom model provider -------------------------------+
  |       http://127.0.0.1:8765/v1                         |
  |         -> Codex provider adapter                      |
  |         -> codex exec --json --ephemeral               |
  |         -> structured message or tool-call response    |
  |                                                        |
  +-- DriftFix MCP connector ------------------------------+
  |                                                        |
  |       Python FastMCP server                            |
  |         -> LangGraph migration workflow                |
  |         -> GitHub Releases API / official Stripe docs  |
  |         -> structured MigrationReport                  |
  |                                                        |
  +-- GitHub connector                                     |
  |       -> read repository                               |
  |       -> create branch and draft PR                    |
  |       -> merge only after human approval               |
  |                                                        |
  +-- Daytona sandbox                                      |
  |       -> clone demo repository                         |
  |       -> install old/new dependencies                  |
  |       -> apply patch and run tests                     |
  |                                                        |
  +-- TrueForge subagents                                  |
          -> impact scan                                   |
          -> independent migration review                  |
```

TrueForge is the outer agent and must remain visibly responsible for the agent loop, tool selection, subagent creation, sandbox execution, session history, and approval. The adapter only supplies model responses. It cannot reach GitHub, Daytona, the target repository, or the DriftFix MCP server directly. LangGraph remains a small deterministic Python workflow behind the DriftFix MCP tools and does not replace TrueForge's agent loop.

This boundary is mandatory for the hackathon: a design where TrueForge makes one call and Codex or LangGraph performs the entire migration is not acceptable. The TrueForge trace must visibly contain the MCP calls, delegated subagents, sandbox work, and human checkpoint.

## 7. End-to-end flow

1. The user asks: `Upgrade the demo repository to the latest stable stripe-python release.`
2. TrueForge sends the conversation and available tool schemas to the local Codex adapter.
3. The adapter runs an isolated Codex turn and returns a structured request to call the DriftFix MCP tool.
4. TrueForge calls the DriftFix MCP server for an upgrade report and records the call in its trace.
5. LangGraph validates the current version, discovers the latest stable GitHub release, fetches official guidance, extracts the target major's breaking changes, and returns a structured report.
6. TrueForge uses the GitHub connector to inspect `demo_target/pyproject.toml`, source files, and tests.
7. TrueForge starts two subagents; their model turns also pass through the adapter, but their lifecycle and traces remain in TrueForge:
   - Impact Scout finds code affected by the reported breaking changes.
   - Migration Reviewer checks that every proposed edit is supported by an official source.
8. TrueForge creates a Daytona sandbox and clones the repository into it.
9. TrueForge upgrades Stripe without changing source code and records the expected failing test.
10. A TrueForge model turn proposes the smallest patch; TrueForge applies it inside Daytona and reruns the test.
11. TrueForge presents a concise migration summary, diff, test results, and source links.
12. TrueForge creates a branch and draft pull request through GitHub.
13. It calls the merge tool only when requested. TrueForge pauses for human approval before that call.

At no point may the adapter run GitHub commands, edit the checked-out target repository, create its own sandbox, or bypass a TrueForge approval.

## 8. Exact demo scenario

The checked-in sample project starts on Stripe Python v14 and contains code equivalent to:

```python
def customer_name(customer):
    return customer.get("name", "Unknown")
```

The sample test passes on v14. Stripe Python v15 removes dictionary methods from `StripeObject`, so the same test fails after the dependency upgrade. The expected repair is:

```python
def customer_name(customer):
    return customer.to_dict().get("name", "Unknown")
```

The fixture must use an actual `stripe.StripeObject`, but it must not call Stripe's network API. This keeps the demonstration real, free, fast, and safe.

The report should also mention other v15 changes, such as native `Decimal` fields, but DriftFix only patches the `.get()` case in the MVP.

## 9. Repository layout

Keep the repository small:

```text
driftfix/
|-- plan.md
|-- README.md
|-- LICENSE
|-- .gitignore
|-- .env.example
|-- pyproject.toml
|-- src/
|   `-- driftfix/
|       |-- __init__.py
|       |-- provider.py        # local OpenAI-compatible Codex adapter
|       |-- server.py          # FastMCP tools and HTTP entry point
|       |-- workflow.py        # LangGraph state, nodes, and report builder
|       `-- schemas.py         # Pydantic request/report models
|-- demo_target/
|   |-- pyproject.toml         # pins Stripe v14 initially
|   |-- customer_service.py    # intentionally outdated usage
|   `-- test_customer_service.py
|-- tests/
|   `-- test_workflow.py       # one focused backend workflow test
|-- agent/
|   `-- SKILL.md               # short DriftFix procedure for TrueForge
|-- schemas/
|   `-- codex_turn.schema.json # message/tool-call output contract
`-- scripts/
    `-- configure_trueforge.py # creates/updates the saved TrueForge agent
```

Do not add more files unless a current file becomes difficult to understand.

## 10. Dependencies

Runtime dependencies:

- `langgraph`: deterministic workflow state and nodes.
- `mcp[cli]`: official Python MCP server with Streamable HTTP.
- `fastapi` and `uvicorn`: the small localhost Codex provider adapter.
- `httpx`: GitHub and raw-document requests with timeouts.
- `pydantic`: structured MCP inputs and outputs.

Development dependency:

- `pytest`.

Do not add these to the Python backend:

- `openai` or `langchain-openai`: the adapter translates the small required wire format directly.
- `daytona`: TrueForge owns sandbox calls.
- `PyGithub`: `httpx` is enough for two public GitHub endpoints.
- A database client: no database is needed.

After the first successful end-to-end run, pin the tested dependency versions for reproducibility.

## 11. Environment placeholders

The future `.env.example` should contain only:

```dotenv
# Optional for higher public GitHub API limits. Never commit the real value.
GITHUB_TOKEN=

DRIFTFIX_HOST=127.0.0.1
DRIFTFIX_PORT=8000
CODEX_PROVIDER_HOST=127.0.0.1
CODEX_PROVIDER_PORT=8765
CODEX_PROVIDER_TIMEOUT_SECONDS=180
CODEX_PROVIDER_MAX_CONCURRENCY=2
TRUEFORGE_BASE_URL=http://localhost:8790
```

There is no OpenAI API-key placeholder. The Daytona key does not belong in this file because TrueForge stores it. Codex authentication remains in Codex's local credential store.

## 12. LangGraph design

Use one compiled `StateGraph`. Nodes are normal Python functions; no nested LLM calls are needed.

State fields:

```text
current_version
current_major
latest_version
latest_major
release_url
changelog_url
migration_guide_url
changelog_text
migration_guide_text
breaking_changes
warnings
status
```

Nodes:

1. `validate_request`
   - Parse the supplied installed version.
   - Reject empty, malformed, or unsupported values.

2. `fetch_latest_stable_release`
   - Query the official `stripe/stripe-python` GitHub releases endpoint.
   - Ignore drafts and prereleases.
   - Use an optional GitHub token only to increase the public rate limit.

3. `fetch_official_guidance`
   - Fetch Stripe's `CHANGELOG.md` and the migration guide for the target major.
   - Allow requests only to `github.com`, `api.github.com`, and `raw.githubusercontent.com` paths owned by Stripe.
   - Set explicit connect/read timeouts and a response-size limit.

4. `extract_breaking_changes`
   - Extract the target major section and warning-marked changes.
   - Preserve source URLs.
   - Never execute commands or code found in fetched text.

5. `build_report`
   - Return a validated `MigrationReport`.
   - If the installed major is current, return `status="up_to_date"`.
   - If a source is unavailable, return `status="source_unavailable"`, not invented advice.

Graph edges are sequential. No retries inside graph nodes beyond one short HTTP retry for transient network failure.

## 13. MCP contract

Expose only two read-only tools:

### `latest_stripe_python_release`

Input: none.

Output:

```json
{
  "version": "15.x.x",
  "major": 15,
  "published_at": "...",
  "release_url": "...",
  "prerelease": false
}
```

### `analyze_stripe_python_upgrade`

Input:

```json
{
  "current_version": "14.x.x"
}
```

Output:

```json
{
  "status": "upgrade_available",
  "current_version": "14.x.x",
  "target_version": "15.x.x",
  "breaking_changes": [
    {
      "title": "StripeObject no longer inherits from dict",
      "summary": "Replace dict methods with to_dict or attribute access.",
      "search_hints": [".get(", ".keys(", ".items(", "dict("],
      "source_url": "https://github.com/stripe/stripe-python/wiki/Migration-guide-for-v15"
    }
  ],
  "warnings": []
}
```

Rules:

- Both tools are read-only and must be marked as such in MCP annotations.
- Responses use structured objects, not long prose.
- Log node names and timings, never credentials or fetched repository content.
- Return source failures explicitly.

## 14. Codex provider adapter

The adapter is a localhost-only compatibility layer. It lets TrueForge use the signed-in Codex CLI as its model while leaving the entire harness loop inside TrueForge.

Endpoints:

- `GET /healthz`: process and Codex-login readiness.
- `GET /v1/models`: exposes one model ID, `codex-subscription`.
- `POST /v1/chat/completions`: accepts the OpenAI-compatible messages and tools sent by TrueForge.
- Add a minimal `/v1/responses` translation only if the installed TrueForge version actually calls it. Confirm the wire format during the first integration spike instead of implementing speculative compatibility.

For each model request, the adapter must:

1. Validate and size-limit the request.
2. Convert system messages, conversation messages, available tool schemas, and tool results into one bounded Codex task.
3. Start Codex without a shell using an argument array equivalent to:

   ```powershell
   codex exec --json --ephemeral --sandbox read-only --skip-git-repo-check --output-schema schemas/codex_turn.schema.json "<bounded task>"
   ```

4. Run it from an empty temporary working directory so it cannot inspect or edit the target repository.
5. Parse JSONL from standard output and accept only the schema-validated final result.
6. Return either an assistant message or one or more OpenAI-compatible tool calls to TrueForge.
7. Let TrueForge execute those calls and include their results in the next model request.

The Codex output schema has two allowed result types:

```json
{
  "kind": "message",
  "content": "Concise response for the user"
}
```

```json
{
  "kind": "tool_calls",
  "calls": [
    {
      "name": "analyze_stripe_python_upgrade",
      "arguments": {"current_version": "14.x.x"}
    }
  ]
}
```

Adapter rules:

- Only return tool names present in the current TrueForge request.
- Never execute a requested MCP, GitHub, Daytona, or shell tool inside the adapter.
- Use `read-only` and `--ephemeral` for every provider turn.
- Allow at most two concurrent Codex processes and enforce a 180-second timeout.
- Retry once only when Codex finishes successfully but returns invalid structured output.
- Treat nonzero exit, timeout, login expiry, malformed JSONL, and rate limiting as typed provider errors.
- Never log prompts, repository contents, credentials, Codex auth data, or raw tool outputs. Log request ID, duration, exit category, and response kind only.
- Do not pass `GITHUB_TOKEN`, Daytona credentials, or repository secrets into the Codex child process.
- Support non-streaming first. If TrueForge requires `stream=true`, buffer the validated Codex result and emit standards-shaped SSE chunks; do not build token-level streaming for the MVP.
- Keep TrueForge session state authoritative. Do not add a second conversation database.
- Defer Codex App Server until after the demo works; `codex exec` is simpler and officially intended for scripted jobs.

Adapter acceptance tests:

- [ ] Health check distinguishes installed, signed-in, signed-out, and timed-out Codex states.
- [ ] A plain-message request returns a valid assistant response.
- [ ] A request containing one fake tool returns a valid tool call without executing it.
- [ ] An unknown tool name is rejected.
- [ ] A malformed Codex response produces a typed error and at most one retry.
- [ ] Two simultaneous requests succeed; a third waits instead of spawning unbounded work.
- [ ] A provider turn cannot read or modify `demo_target`.
- [ ] No OpenAI Platform API key is present or required.

## 15. TrueForge agent configuration

Saved agent name: `driftfix`.

Model provider:

- Provider type: `custom`.
- Provider name: `codex-local`.
- Base URL: `http://127.0.0.1:8765/v1`.
- API key: leave blank because the adapter is loopback-only. If the UI requires a value, use a documented local placeholder, never a real credential.
- Model ID and display name: `codex-subscription`.
- Run a plain-message and tool-call smoke test before creating the saved agent.

Connectors:

- `driftfix-mcp` at `http://localhost:8000/mcp`.
- TrueForge's GitHub connector.

Capabilities:

- Sandbox enabled.
- Dynamic subagents enabled.
- Ask-user-questions enabled.
- Generative UI may stay enabled, but a markdown migration table is sufficient.
- Iteration limit: 30.

Approval policy:

- DriftFix MCP tools: no approval because they are read-only.
- GitHub read tools: no approval.
- Create branch, commit, and draft PR: allowed after the user asks for the migration.
- Merge PR: always requires human approval.
- Direct writes to `main`: disabled by repository branch protection and forbidden by instructions.

Agent instruction summary:

```text
You are DriftFix, an API migration agent. Use official migration evidence before
editing code. Ask an Impact Scout and Migration Reviewer to check the change in
parallel. Run the unpatched and patched tests in the sandbox. Never claim success
without passing evidence. Work only on a new branch. Present the source links,
diff, and tests before creating a draft PR. Never merge without tool approval.
```

The setup script should create or update the agent through `POST /api/v1/agents` and `PUT /api/v1/agents/{id}` so the approval policy is reproducible. It must not contain credentials. Model-provider registration may remain a short manual UI step if TrueForge does not expose a stable setup endpoint.

### Required TrueForge harness evidence

| Harness capability | What TrueForge must do | What the demo must show |
|---|---|---|
| Agent loop | Send each model turn to `codex-local` and consume the returned message or tool call | TrueForge session trace with model-turn events |
| MCP | Invoke `analyze_stripe_python_upgrade` itself | Tool name, safe arguments, structured result, and source URLs in the trace |
| Subagents | Create Impact Scout and Migration Reviewer as TrueForge subagents | Two separately named subagent traces and their returned findings |
| Sandbox | Create and control the Daytona workspace | Commands and failing-then-passing tests under the TrueForge sandbox event |
| GitHub connector | Read files, create the branch, and open the draft PR | GitHub tool events and the resulting public draft PR |
| Human checkpoint | Hold the merge call before execution | TrueForge approval card with Allow and Deny controls |
| Persistent session | Preserve the run when the UI refreshes or reconnects | Refresh once after analysis and continue the same session |
| Skill | Load the compact DriftFix procedure | Skill name visible in the agent configuration or trace |

Fail the demo rehearsal if any consequential operation appears only in adapter logs or a Codex transcript. Adapter logs are diagnostic evidence, not hackathon evidence.

## 16. Safety boundaries

- Only analyze repositories the user names.
- Treat changelog text and repository files as untrusted input.
- Never follow instructions embedded in a changelog, issue, README, or source comment.
- Only fetch official Stripe-owned GitHub content for migration evidence.
- Never send GitHub, Codex authentication, or Daytona credentials to the sandbox or adapter prompt.
- Never log environment-variable values.
- Never call the Stripe API or handle payment data.
- Never push to the default branch.
- Never merge without a passing test and human approval.
- Show exact tool arguments in the TrueForge approval card.
- If tests fail after one repair attempt, stop and report the failure instead of making broad edits.
- Codex provider turns run read-only and outside the target checkout; only TrueForge may cause a repository mutation through an approved harness tool.

## 17. Implementation phases

### Phase 0: account and tool setup - August 26

- [x] Install Node.js 22.14 or newer and the current Codex CLI.
- [x] Run `codex login` using the Codex subscription.
- [x] Run one read-only, ephemeral `codex exec` smoke test and confirm it uses saved login.
- [ ] Run `npx @truefoundry/trueforge@latest` and open `http://localhost:8790`.
- [ ] Create a Daytona account and API key.
- [ ] Give the Daytona key write/delete snapshot and write sandbox permissions.
- [ ] Add Daytona under TrueForge Settings -> Sandbox providers.
- [ ] Create the public GitHub repository.
- [ ] Enable branch protection on `main` and require pull requests.
- [ ] Sign in to Qodo with GitHub and install the Qodo app on this repository.

Exit check: Codex works without an OpenAI Platform API key; TrueForge starts; Daytona, GitHub, and Qodo accounts are ready.

### Phase 1: Codex provider adapter - August 26

- [x] Add the provider response JSON Schema.
- [x] Implement `/healthz`, `/v1/models`, and the minimum completion endpoint TrueForge actually calls.
- [x] Launch Codex with `asyncio.create_subprocess_exec`, never `shell=True`.
- [ ] Add timeout, concurrency limit, output validation, error mapping, and safe logs.
- [ ] Add message and tool-call adapter tests with a fake Codex executable.
- [ ] Start the adapter on `127.0.0.1:8765`.
- [ ] Add `codex-local` under TrueForge Settings -> Models.
- [ ] Verify a plain response and a fake tool call through TrueForge.

Exit check: a TrueForge turn is answered through the local adapter, and TrueForge executes a fake tool call returned by Codex.

### Phase 2: deterministic backend - August 26 to 27

- [x] Create `pyproject.toml` and the package layout.
- [ ] Implement Pydantic report schemas.
- [ ] Implement latest stable Stripe release lookup.
- [ ] Implement official changelog and migration-guide retrieval.
- [ ] Implement the five-node LangGraph workflow.
- [ ] Add one workflow test using saved HTTP responses or dependency injection.
- [ ] Ensure network failures return a typed error report.

Exit check: a local Python call with a v14 version returns a sourced v15 migration report.

### Phase 3: MCP and demo target - August 27

- [ ] Wrap the graph in two FastMCP read-only tools.
- [ ] Run Streamable HTTP at `http://localhost:8000/mcp`.
- [ ] Verify tools using MCP Inspector.
- [ ] Add the v14 sample project and passing baseline test.
- [ ] Confirm the test fails after upgrading to v15 without a source edit.
- [ ] Confirm the minimal manual patch makes it pass.

Exit check: TrueForge can call `analyze_stripe_python_upgrade` and receive structured output.

### Phase 4: TrueForge end-to-end workflow - August 27 to 28

- [ ] Add the DriftFix MCP and GitHub connectors.
- [ ] Add the compact DriftFix skill.
- [ ] Enable Daytona and dynamic subagents.
- [ ] Create the saved `driftfix` agent.
- [ ] Configure tool filters and merge approval.
- [ ] Confirm Impact Scout and Migration Reviewer are created by TrueForge and visible as subagent traces.
- [ ] Confirm the Codex adapter cannot see the target checkout and returns only messages or tool calls.
- [ ] Run the full migration in a fresh session.
- [ ] Create a branch and draft PR from the result.
- [ ] Verify Deny leaves the PR unmerged.
- [ ] Verify Allow merges only after tests pass.

Exit check: one uninterrupted TrueForge session completes the whole judge story, and its trace proves TrueForge performed every tool, sandbox, delegation, and approval step.

### Phase 5: quality and submission - August 29 to 30

- [ ] Open implementation PRs so Qodo reviews the code.
- [ ] Address all relevant Qodo findings and document any rejected suggestion.
- [x] Add MIT license and secret-safe `.gitignore`.
- [ ] Write a short README with setup, architecture, safety, and demo commands.
- [ ] Add one screenshot of the migration report and one approval screenshot.
- [ ] Add one screenshot showing the TrueForge trace with the MCP call, subagents, and Daytona execution.
- [ ] Rehearse the demo twice from a clean checkout.
- [ ] Record the approximately three-minute video.
- [ ] Add the public repository, video, write-up, and AI-assistant disclosure to the submission.
- [ ] Submit before the internal 10:00 PM IST target on August 30.

## 18. Test plan

| Test | Expected result |
|---|---|
| Codex is signed out | Adapter reports a clear readiness error; TrueForge does not start a migration |
| Codex exceeds 180 seconds | Child process is terminated and a typed timeout reaches TrueForge |
| Codex returns malformed output | One retry, then a typed provider error |
| Codex asks for an unavailable tool | Adapter rejects it; nothing executes |
| Third concurrent Codex request | It waits behind the two-process limit |
| TrueForge requests a fake tool | Adapter returns the call; TrueForge visibly executes it |
| Latest-release response includes a prerelease | Prerelease is ignored |
| Installed major equals latest major | `up_to_date` report |
| Installed version is malformed | Validated error, no network work |
| GitHub is unavailable | `source_unavailable`, no invented migration |
| Migration guide exceeds size limit | Request stops safely |
| v14 demo before dependency upgrade | Test passes |
| v15 dependency with old `.get()` code | Test fails for the expected reason |
| v15 dependency with patched code | Test passes |
| Merge tool called | TrueForge approval card appears |
| Merge denied | PR remains open and `main` is unchanged |
| Adapter process attempts repository access | It cannot access the target checkout and cannot mutate files |
| Recorded harness audit | TrueForge trace contains MCP, subagent, Daytona, GitHub, and approval events |
| UI refresh after analysis | The same TrueForge session resumes with its prior state |
| Secret scan | No key or token in tracked files or logs |

Only add more tests for bugs actually found during integration.

## 19. Three-minute demo script

### 0:00 to 0:20 - problem

"A dependency can change underneath an integration. Engineers must find the right changelog, locate affected code, patch it, test it, and review the blast radius. DriftFix does that work without taking away the final decision."

### 0:20 to 0:40 - outdated repository

- Show Stripe v14 in `demo_target/pyproject.toml`.
- Show the working `.get()` call and green baseline test.
- Briefly show TrueForge using the `codex-local / codex-subscription` custom model. Do not show Codex credentials.

### 0:40 to 1:15 - current evidence

- Ask DriftFix to upgrade to the latest stable Stripe Python release.
- Point out that Codex supplies reasoning through the localhost adapter while the visible loop remains in TrueForge.
- Show the LangGraph MCP tool automatically finding v15.
- Show the official Stripe release and migration-guide links.
- Show the two TrueForge subagent traces.

### 1:15 to 1:55 - safe implementation

- Show the upgraded dependency causing the test to fail in Daytona.
- Show DriftFix applying the minimal `to_dict().get()` repair.
- Show the test passing.
- Keep the TrueForge trace panel visible so the sandbox execution is unmistakable.

### 1:55 to 2:25 - controlled change

- Show the migration summary and diff.
- Show the draft PR created on a branch.
- Attempt merge and pause on TrueForge's human-approval card.

### 2:25 to 3:00 - result

- Approve the merge in the test repository or deny it and show `main` unchanged.
- Close with: "Codex reasons, but TrueForge controls every tool, sandbox, subagent, and irreversible action. DriftFix turns official API changes into sourced, tested, human-controlled migrations."

## 20. Judging-criteria map

| Criterion | What judges see |
|---|---|
| Potential impact | Reduces dependency-upgrade work and outage risk |
| Originality | Combines live migration evidence, impact analysis, repair, and proof |
| Technical excellence | Validated Codex adapter, structured LangGraph workflow, typed MCP, deterministic failing/passing test |
| TrueForge use | TrueForge-owned loop, MCP calls, subagents, persistent session, Daytona sandbox, skill, and approval |
| Control and safety | Official-source allowlist, branch-only work, passing-test gate, merge approval |
| Presentation | Clear red test -> patch -> green test -> approval story |

## 21. Resource controls

- Keep prompts and MCP responses short and structured.
- Use `codex exec --ephemeral` so provider turns do not accumulate a second history store.
- Limit the adapter to two concurrent Codex processes and reuse the full TrueForge conversation supplied in each request.
- Use deterministic Python for release parsing and changelog extraction.
- Do not call an LLM from LangGraph.
- Use one TrueForge session for rehearsal and one for recording when possible.
- Do not use OpenAI web-search tools; the backend fetches official public URLs directly.
- Daytona is created on demand by TrueForge; prewarm the demo session before recording.
- There is no OpenAI Platform API spend. Monitor Codex subscription rate limits during rehearsal.

## 22. Risks and fallbacks

| Risk | Response |
|---|---|
| TrueForge wire format differs from the adapter | Capture the first localhost request and implement only the required Chat Completions or Responses translation |
| Codex login expires | `/healthz` fails clearly; run `codex login` again before rehearsal and recording |
| Codex subscription rate limit interrupts the flow | Keep prompts bounded, cap concurrency at two, preflight immediately before recording, and avoid unnecessary reruns |
| Codex returns invalid tool-call JSON | Enforce JSON Schema, reject unknown tools, and retry once |
| Provider turn is slow | Use a 180-second timeout, show progress in TrueForge, and prewarm one harmless turn |
| TrueForge looks like a thin wrapper | Keep all MCP, subagent, Daytona, GitHub, and approval events inside TrueForge and show them in the trace |
| Judge lacks Codex access | README states the prerequisite clearly; include a complete three-minute recorded run and sample trace screenshots |
| Latest Stripe release lookup fails during demo | Use a checked-in small v15 evidence fixture with source URLs and clearly label offline mode |
| Latest stable major changes before judging | Keep automatic discovery, but preserve the v14 -> v15 demo fixture as the tested scenario |
| GitHub rate limit | Add optional token to the backend or use TrueForge's authenticated GitHub connector |
| GitHub MCP cannot enforce merge-only approval | Gate all GitHub write tools; this is safer and still demonstrates control |
| Daytona setup blocks progress | Use it through TrueForge only; ask TrueFoundry Discord for provider setup help |
| Agent makes an overbroad patch | Limit edits to `demo_target`, show diff, run test, and stop after one failed repair |
| Qodo feedback arrives late | Open the first real PR by August 28, not on submission day |
| Full flow exceeds three minutes | Prewarm the sandbox and edit dead time from the recorded demo |

## 23. Definition of done

DriftFix is done when:

- [ ] A clean checkout can install and run the backend from README instructions.
- [ ] A signed-in Codex user can start the localhost provider without an OpenAI Platform API key.
- [ ] TrueForge can use `codex-subscription` for plain messages and tool calls.
- [ ] TrueForge can connect to the local MCP server.
- [ ] The latest stable Stripe release is discovered automatically.
- [ ] The report cites official evidence and does not hallucinate missing content.
- [ ] The real v14-to-v15 fixture fails before the patch and passes after it.
- [ ] Daytona performs the migration test.
- [ ] A draft GitHub PR is created from a non-default branch.
- [ ] Merge pauses for human approval.
- [ ] The recorded trace proves that TrueForge owns MCP execution, both subagents, Daytona execution, GitHub actions, and the approval pause.
- [ ] The TrueForge session survives one UI refresh or reconnect during rehearsal.
- [ ] Codex cannot directly access the target checkout or credentials in provider mode.
- [ ] Qodo has reviewed the implementation PR and relevant findings are addressed.
- [ ] No secret exists in source, Git history, screenshots, or video.
- [ ] README, demo video, short write-up, and AI-tool disclosure are ready.
- [ ] The final submission has been opened once after submitting to verify its links.

## 24. Official references

- TrueForge quickstart: https://trueforge.dev/quickstart
- TrueForge custom model providers: https://trueforge.dev/models
- TrueForge agent configuration and approvals: https://trueforge.dev/create-agent/overview
- TrueForge MCP setup: https://trueforge.dev/mcp-servers
- TrueForge sandbox setup: https://trueforge.dev/sandbox
- TrueForge SDK concepts: https://trueforge.dev/api/overview
- Daytona documentation: https://www.daytona.io/docs/en/
- Daytona API-key permissions: https://www.daytona.io/docs/en/api-keys/
- LangGraph Graph API: https://docs.langchain.com/oss/python/langgraph/use-graph-api
- Official Python MCP SDK: https://github.com/modelcontextprotocol/python-sdk
- Stripe OpenAPI repository: https://github.com/stripe/openapi
- Stripe Python repository: https://github.com/stripe/stripe-python
- Stripe Python releases: https://github.com/stripe/stripe-python/releases
- Stripe Python v15 migration guide: https://github.com/stripe/stripe-python/wiki/Migration-guide-for-v15
- Qodo setup: https://docs.qodo.ai/get-started
- Codex authentication: https://learn.chatgpt.com/docs/auth
- Codex non-interactive mode: https://learn.chatgpt.com/docs/non-interactive-mode
- Codex App Server, deferred beyond MVP: https://learn.chatgpt.com/docs/app-server
