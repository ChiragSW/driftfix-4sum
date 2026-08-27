import asyncio
from datetime import datetime, timezone

from mcp import Client

import driftfix.server as server
from driftfix.schemas import MigrationReport, StripeRelease


def test_mcp_exposes_two_read_only_structured_tools(monkeypatch) -> None:
    release = StripeRelease(
        version="15.2.0",
        major=15,
        published_at=datetime(2026, 8, 20, tzinfo=timezone.utc),
        release_url="https://github.com/stripe/stripe-python/releases/tag/v15.2.0",
    )
    report = MigrationReport(
        status="upgrade_available",
        current_version="14.3.0",
        target_version="15.2.0",
    )
    monkeypatch.setattr(server, "latest_release", lambda: release)
    monkeypatch.setattr(server, "analyze_upgrade", lambda _version: report)

    async def exercise_tools() -> None:
        async with Client(server.mcp) as client:
            tools = (await client.list_tools()).tools
            assert [tool.name for tool in tools] == [
                "latest_stripe_python_release",
                "analyze_stripe_python_upgrade",
            ]
            assert all(tool.annotations.read_only_hint for tool in tools)
            assert all(tool.annotations.destructive_hint is False for tool in tools)
            assert all(tool.output_schema is not None for tool in tools)

            latest = await client.call_tool("latest_stripe_python_release")
            analysis = await client.call_tool(
                "analyze_stripe_python_upgrade",
                {"current_version": "14.3.0"},
            )
            assert latest.is_error is False
            assert latest.structured_content["version"] == "15.2.0"
            assert analysis.is_error is False
            assert analysis.structured_content["status"] == "upgrade_available"

    asyncio.run(exercise_tools())
