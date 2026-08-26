# DriftFix

DriftFix turns Stripe SDK breaking changes into sourced, sandbox-tested migration pull requests. Codex supplies model reasoning through a local adapter; TrueForge owns tools, subagents, Daytona execution, session state, and human approval.

## Status

The local provider now supports schema-validated, non-streaming chat and tool-call turns through `codex exec`. Provider hardening, streaming compatibility, and TrueForge wiring are the next checkpoints in [plan.md](plan.md).

## Prerequisites

- Python 3.11+
- Node.js 22.14+
- Codex CLI authenticated with `codex login`
- TrueForge, Daytona, GitHub, and Qodo for the full demo

No OpenAI Platform API key is required.
