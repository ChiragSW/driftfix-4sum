"""Read-only MCP transport for the deterministic DriftFix workflow."""

import logging

from mcp.server import MCPServer
from mcp.types import ToolAnnotations

from .schemas import MigrationReport, StripeRelease
from .workflow import (
    analyze_stripe_python_upgrade as analyze_upgrade,
    latest_stripe_python_release as latest_release,
)

READ_ONLY = ToolAnnotations(
    readOnlyHint=True,
    destructiveHint=False,
    idempotentHint=True,
    openWorldHint=True,
)

mcp = MCPServer(
    "driftfix",
    description="Official, structured Stripe Python migration evidence.",
)


@mcp.tool(annotations=READ_ONLY, structured_output=True)
def latest_stripe_python_release() -> StripeRelease:
    """Return the latest stable stripe-python release from official GitHub data."""
    return latest_release()


@mcp.tool(annotations=READ_ONLY, structured_output=True)
def analyze_stripe_python_upgrade(current_version: str) -> MigrationReport:
    """Compare an installed stripe-python version with official migration guidance."""
    return analyze_upgrade(current_version)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    mcp.run(
        transport="streamable-http",
        host="127.0.0.1",
        port=8000,
        streamable_http_path="/mcp",
    )
