# DriftFix Frontend Scaffold

A reactive, dark-themed control center and visualizer for the **DriftFix** Stripe Python migration workflow.

---

## ⚡ Quick Start

```bash
cd frontend
npm install
npm run dev
```

The frontend will run locally on `http://localhost:3000`.

---

## 🧭 Capabilities & Backend Mapping

| View / Tool | Backend Functionality & Endpoint |
|---|---|
| **Overview & Architecture** | Displays the full TrueForge + Codex + MCP + Daytona orchestration pipeline and hackathon evidence. |
| **Migration Analyzer** | Calls the deterministic MCP tool `analyze_stripe_python_upgrade` and `latest_stripe_python_release`, displaying breaking changes and official source links. |
| **Impact Scout & Fixer** | Simulates the parallel subagents: scans code for breaking `.get()`, `.keys()`, `.items()`, `dict(obj)` patterns and produces verified `.to_dict()` patches with diffs. |
| **Daytona Sandbox Runner** | Deterministic 4-stage test pipeline (7 passed v14 → 7 failed v15 → 7 passed v15 patched). |
| **Codex Provider Playground** | Tests the localhost OpenAI-compatible adapter at `/v1/chat/completions` and inspects `/healthz` & `/v1/models`. |
| **TrueForge Workflow** | Full session trace visualizer and interactive Human Merge Approval Checkpoint. |

---

## 🛠️ Configuration & Proxy

Vite is configured to proxy API calls directly to the local backend services:
- `/api/provider` ➔ `http://127.0.0.1:8765` (Codex Provider Adapter)
- `/api/mcp` ➔ `http://127.0.0.1:8000` (FastMCP Streamable HTTP Server)
