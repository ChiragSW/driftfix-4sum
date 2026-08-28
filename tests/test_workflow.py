import httpx
import pytest
from pydantic import ValidationError

import driftfix.workflow as workflow
from driftfix.schemas import OfficialGuidance, StripeRelease
from driftfix.workflow import (
    GuidanceLookupError,
    ReleaseLookupError,
    analyze_stripe_python_upgrade,
    build_workflow,
    fetch_official_guidance,
    latest_stripe_python_release,
)


def _client(payload: object, status_code: int = 200) -> httpx.Client:
    return httpx.Client(
        transport=httpx.MockTransport(
            lambda request: httpx.Response(status_code, json=payload, request=request)
        )
    )


def _release(**overrides: object) -> dict[str, object]:
    return {
        "tag_name": "v15.2.0",
        "html_url": "https://github.com/stripe/stripe-python/releases/tag/v15.2.0",
        "published_at": "2026-08-20T10:00:00Z",
        "draft": False,
        "prerelease": False,
        **overrides,
    }


def test_latest_release_is_normalized_and_validated() -> None:
    payload = [
        _release(tag_name="v16.0.0-beta.1", prerelease=True),
        _release(tag_name="v17.0.0", draft=True),
        _release(tag_name="v15.1.0"),
        _release(),
    ]
    with _client(payload) as client:
        result = latest_stripe_python_release(client=client)

    assert result.version == "15.2.0"
    assert result.major == 15
    assert str(result.release_url).startswith(
        "https://github.com/stripe/stripe-python/releases/"
    )
    assert result.prerelease is False


@pytest.mark.parametrize(
    "override",
    [
        {"prerelease": True},
        {"draft": True},
        {"tag_name": "v15.2.0rc1"},
        {"html_url": "https://example.com/fake-release"},
    ],
)
def test_latest_release_rejects_non_stable_or_untrusted_data(
    override: dict[str, object],
) -> None:
    with _client([_release(**override)]) as client:
        with pytest.raises(ReleaseLookupError):
            latest_stripe_python_release(client=client)


def test_latest_release_maps_network_failures_to_typed_error() -> None:
    def fail(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("offline", request=request)

    with httpx.Client(transport=httpx.MockTransport(fail)) as client:
        with pytest.raises(ReleaseLookupError):
            latest_stripe_python_release(client=client)


def test_release_schema_rejects_a_mismatched_major() -> None:
    with pytest.raises(ValidationError):
        StripeRelease(
            version="15.2.0",
            major=14,
            published_at="2026-08-20T10:00:00Z",
            release_url="https://github.com/stripe/stripe-python/releases/tag/v15.2.0",
        )


def test_official_guidance_fetches_only_expected_stripe_sources() -> None:
    requested: list[str] = []

    def respond(request: httpx.Request) -> httpx.Response:
        requested.append(str(request.url))
        text = "## 15.2.0\nchange" if "CHANGELOG" in request.url.path else "# v15\n.get()"
        return httpx.Response(200, text=text, request=request)

    with httpx.Client(transport=httpx.MockTransport(respond)) as client:
        result = fetch_official_guidance("15.2.0", client=client)

    assert requested == [
        "https://raw.githubusercontent.com/stripe/stripe-python/v15.2.0/CHANGELOG.md",
        "https://raw.githubusercontent.com/wiki/stripe/stripe-python/Migration-guide-for-v15.md",
    ]
    assert "15.2.0" in result.changelog_text
    assert ".get()" in result.migration_guide_text
    assert str(result.migration_guide_url).endswith("Migration-guide-for-v15")


def test_official_guidance_retries_one_transient_failure() -> None:
    attempts = 0

    def respond(request: httpx.Request) -> httpx.Response:
        nonlocal attempts
        if "CHANGELOG" in request.url.path:
            attempts += 1
            if attempts == 1:
                return httpx.Response(503, request=request)
        return httpx.Response(200, text="official guidance", request=request)

    with httpx.Client(transport=httpx.MockTransport(respond)) as client:
        fetch_official_guidance("15.2.0", client=client)

    assert attempts == 2


def test_official_guidance_blocks_untrusted_and_oversized_sources(
    monkeypatch,
) -> None:
    with _client({}) as client:
        with pytest.raises(GuidanceLookupError, match="non-Stripe"):
            workflow._fetch_text(client, "https://example.com/CHANGELOG.md")

    monkeypatch.setattr(workflow, "MAX_SOURCE_BYTES", 4)
    with httpx.Client(
        transport=httpx.MockTransport(
            lambda request: httpx.Response(200, text="12345", request=request)
        )
    ) as client:
        with pytest.raises(GuidanceLookupError, match="size limit"):
            workflow._fetch_text(
                client,
                "https://raw.githubusercontent.com/stripe/stripe-python/"
                "v15.2.0/CHANGELOG.md",
            )


def _guidance() -> OfficialGuidance:
    return OfficialGuidance(
        changelog_url="https://github.com/stripe/stripe-python/blob/v15.2.0/CHANGELOG.md",
        migration_guide_url="https://github.com/stripe/stripe-python/wiki/Migration-guide-for-v15",
        changelog_text=(
            "## 15.2.0\nrelease notes\n"
            "* ⚠️ Remove support for `legacy_field` on `Example`\n"
            "## 14.0.0\n* old warning"
        ),
        migration_guide_text="""# Migration guide

## `StripeObject` no longer inherits from `dict`

Stripe objects now use attribute access, bracket notation, or `to_dict()`.

### Migrating

Replace `.get()` with `to_dict().get()` or `getattr()`.

## Decimal fields use `Decimal` instead of `str`

Decimal-formatted fields now use Python's `Decimal` type.
""",
    )


def _graph(*, guidance_lookup=lambda _version: _guidance()):
    release = StripeRelease(
        version="15.2.0",
        major=15,
        published_at="2026-08-20T10:00:00Z",
        release_url="https://github.com/stripe/stripe-python/releases/tag/v15.2.0",
    )
    return build_workflow(
        release_lookup=lambda: release, guidance_lookup=guidance_lookup
    )


def test_workflow_builds_a_sourced_upgrade_report() -> None:
    report = analyze_stripe_python_upgrade("14.3.0", graph=_graph())

    assert report.status == "upgrade_available"
    assert report.target_version == "15.2.0"
    assert [change.title for change in report.breaking_changes] == [
        "StripeObject no longer inherits from dict",
        "Decimal fields use Decimal instead of str",
        "Remove support for `legacy_field` on `Example`",
    ]
    assert ".get(" in report.breaking_changes[0].search_hints
    assert str(report.breaking_changes[0].source_url).endswith(
        "#stripeobject-no-longer-inherits-from-dict"
    )


def test_workflow_skips_guidance_when_current_major_is_latest() -> None:
    def should_not_run(_version: str) -> OfficialGuidance:
        raise AssertionError("guidance lookup should be skipped")

    report = analyze_stripe_python_upgrade(
        "15.0.0", graph=_graph(guidance_lookup=should_not_run)
    )

    assert report.status == "up_to_date"
    assert report.breaking_changes == []


def test_workflow_returns_typed_report_when_guidance_is_unavailable() -> None:
    def unavailable(_version: str) -> OfficialGuidance:
        raise GuidanceLookupError("offline")

    report = analyze_stripe_python_upgrade(
        "14.3.0", graph=_graph(guidance_lookup=unavailable)
    )

    assert report.status == "source_unavailable"
    assert report.target_version == "15.2.0"
    assert report.warnings == ["Official Stripe migration guidance is unavailable."]


def test_workflow_returns_typed_report_when_release_is_unavailable() -> None:
    def unavailable() -> StripeRelease:
        raise ReleaseLookupError("offline")

    graph = build_workflow(release_lookup=unavailable)
    report = analyze_stripe_python_upgrade("14.3.0", graph=graph)

    assert report.status == "source_unavailable"
    assert report.target_version is None
    assert report.warnings == ["The latest stable Stripe release is unavailable."]


def test_workflow_rejects_a_malformed_installed_version() -> None:
    with pytest.raises(ValidationError):
        analyze_stripe_python_upgrade("fourteen", graph=_graph())
