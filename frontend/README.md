# DriftFix Frontend Scaffold

A reactive, dark-themed control center and visualizer for the **DriftFix** Stripe Python migration workflow.

---

## ⚡ Quick Start

```bash
# From the repository root, once:
python -m pip install -e ".[dev]"

# Terminal 1:
cd frontend
npm run provider

# Terminal 2:
npm install
npm run dev
```

The frontend will run locally on `http://localhost:3000`. Its API provider must remain available on `http://127.0.0.1:8765`; `python -m driftfix.server` only starts the separate MCP service on port `8000`.

---

## 🧭 Capabilities & Backend Mapping

| View / Tool | Backend Functionality & Endpoint |
|---|---|
| **Overview & Architecture** | Fetches live report bodies from open and merged PRs through `/api/pull-reports` and displays the demo evidence. |
| **Migration Analyzer** | Calls the deterministic MCP tool `analyze_stripe_python_upgrade` and `latest_stripe_python_release`, displaying breaking changes and official source links. |
| **Impact Scout & Fixer** | Simulates the parallel subagents: scans code for breaking `.get()`, `.keys()`, `.items()`, `dict(obj)` patterns and produces verified `.to_dict()` patches with diffs. |
| **Daytona Sandbox Runner** | Deterministic 4-stage test pipeline (7 passed v14 → 7 failed v15 → 7 passed v15 patched). |
| **Codex Provider Playground** | Tests the localhost OpenAI-compatible adapter at `/v1/chat/completions` and inspects `/healthz` & `/v1/models`. |
| **TrueForge Workflow** | Recorded session trace visualizer with a local replay of the Human Merge Approval Checkpoint. |

---

## 🛠️ Configuration & Proxy

Vite is configured to proxy API calls directly to the local backend services:
- `/api/provider` ➔ `http://127.0.0.1:8765` (Codex Provider Adapter)
- `/api/mcp` ➔ `http://127.0.0.1:8000` (FastMCP Streamable HTTP Server)

Set `DRIFTFIX_GITHUB_REPOSITORY=owner/repository` on the provider process. A public repository works without authentication; an optional `GITHUB_TOKEN` raises GitHub's API rate limit and is never sent to the browser.
