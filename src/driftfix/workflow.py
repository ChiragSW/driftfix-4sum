"""Deterministic Stripe release discovery and migration workflow pieces."""

import os
import re
from datetime import datetime
from typing import Callable, NotRequired, TypedDict
from urllib.parse import urlsplit

import httpx
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, ConfigDict, HttpUrl, ValidationError

from .schemas import (
    BreakingChange,
    MigrationReport,
    OfficialGuidance,
    StripeRelease,
    UpgradeRequest,
)

GITHUB_RELEASE_URL = "https://api.github.com/repos/stripe/stripe-python/releases"
STRIPE_RELEASE_PREFIX = "https://github.com/stripe/stripe-python/releases/"
VERSION_TAG = re.compile(r"^v?(\d+)\.(\d+)\.(\d+)$")
MAX_SOURCE_BYTES = 2_000_000
MAX_CHANGELOG_WARNINGS = 12
SOURCE_PATHS = {
    "api.github.com": ("/repos/stripe/stripe-python/",),
    "github.com": ("/stripe/stripe-python/",),
    "raw.githubusercontent.com": (
        "/stripe/stripe-python/",
        "/wiki/stripe/stripe-python/",
    ),
}


class ReleaseLookupError(RuntimeError):
    """The official latest-release response could not be trusted or read."""


class GuidanceLookupError(RuntimeError):
    """Official Stripe migration guidance could not be safely retrieved."""


class _GitHubRelease(BaseModel):
    model_config = ConfigDict(extra="ignore")

    tag_name: str
    html_url: HttpUrl
    published_at: datetime
    draft: bool
    prerelease: bool


class WorkflowState(TypedDict):
    current_version: str
    current_major: NotRequired[int]
    latest_version: NotRequired[str]
    latest_major: NotRequired[int]
    release_url: NotRequired[str]
    guidance: NotRequired[OfficialGuidance]
    breaking_changes: NotRequired[list[BreakingChange]]
    warnings: NotRequired[list[str]]
    status: NotRequired[str]
    report: NotRequired[MigrationReport]


def latest_stripe_python_release(
    *, token: str | None = None, client: httpx.Client | None = None
) -> StripeRelease:
    """Return GitHub's latest published full stripe-python release."""
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "driftfix/0.1",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    token = token if token is not None else os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    owns_client = client is None
    client = client or httpx.Client(
        timeout=httpx.Timeout(10.0, connect=5.0), follow_redirects=False
    )
    try:
        response = client.get(GITHUB_RELEASE_URL, headers=headers, params={"per_page": 30})
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, list):
            raise ValueError("release response must be a list")
    except (httpx.HTTPError, ValueError, ValidationError) as exc:
        raise ReleaseLookupError("GitHub's latest Stripe release is unavailable") from exc
    finally:
        if owns_client:
            client.close()

    candidates: list[tuple[tuple[int, int, int], _GitHubRelease]] = []
    for item in payload:
        try:
            release = _GitHubRelease.model_validate(item)
        except ValidationError:
            continue
        match = VERSION_TAG.fullmatch(release.tag_name)
        if (
            release.draft
            or release.prerelease
            or match is None
            or not str(release.html_url).startswith(STRIPE_RELEASE_PREFIX)
        ):
            continue
        candidates.append((tuple(map(int, match.groups())), release))

    if not candidates:
        raise ReleaseLookupError("GitHub returned no stable Stripe release")

    version_parts, release = max(candidates, key=lambda candidate: candidate[0])
    version = ".".join(map(str, version_parts))
    return StripeRelease(
        version=version,
        major=version_parts[0],
        published_at=release.published_at,
        release_url=release.html_url,
        prerelease=False,
    )


def _is_official_source(url: str) -> bool:
    parsed = urlsplit(url)
    prefixes = SOURCE_PATHS.get(parsed.hostname or "", ())
    return (
        parsed.scheme == "https"
        and parsed.username is None
        and parsed.password is None
        and parsed.port in (None, 443)
        and any(parsed.path.startswith(prefix) for prefix in prefixes)
    )


def _fetch_text(client: httpx.Client, url: str) -> str:
    if not _is_official_source(url):
        raise GuidanceLookupError("Refusing to fetch a non-Stripe source")

    for attempt in range(2):
        try:
            with client.stream(
                "GET",
                url,
                headers={"User-Agent": "driftfix/0.1"},
                follow_redirects=False,
            ) as response:
                response.raise_for_status()
                content = bytearray()
                for chunk in response.iter_bytes():
                    content.extend(chunk)
                    if len(content) > MAX_SOURCE_BYTES:
                        raise GuidanceLookupError("Official source exceeds size limit")
            text = content.decode("utf-8")
            if not text.strip():
                raise GuidanceLookupError("Official source is empty")
            return text
        except httpx.HTTPStatusError as exc:
            transient = exc.response.status_code == 429 or exc.response.status_code >= 500
            if attempt == 0 and transient:
                continue
            raise GuidanceLookupError("Official source request failed") from exc
        except httpx.TransportError as exc:
            if attempt == 0:
                continue
            raise GuidanceLookupError("Official source request failed") from exc
        except UnicodeDecodeError as exc:
            raise GuidanceLookupError("Official source is not UTF-8 text") from exc

    raise AssertionError("unreachable")


def fetch_official_guidance(
    target_version: str, *, client: httpx.Client | None = None
) -> OfficialGuidance:
    """Fetch the changelog at a release tag and that major's migration guide."""
    match = VERSION_TAG.fullmatch(target_version)
    if match is None:
        raise GuidanceLookupError("Target version must be a stable semantic version")

    version = ".".join(match.groups())
    major = match.group(1)
    changelog_url = (
        f"https://github.com/stripe/stripe-python/blob/v{version}/CHANGELOG.md"
    )
    migration_guide_url = (
        f"https://github.com/stripe/stripe-python/wiki/Migration-guide-for-v{major}"
    )
    raw_changelog_url = (
        f"https://raw.githubusercontent.com/stripe/stripe-python/v{version}/CHANGELOG.md"
    )
    raw_migration_guide_url = (
        "https://raw.githubusercontent.com/wiki/stripe/stripe-python/"
        f"Migration-guide-for-v{major}.md"
    )

    owns_client = client is None
    client = client or httpx.Client(
        timeout=httpx.Timeout(10.0, connect=5.0), follow_redirects=False
    )
    try:
        changelog_text = _fetch_text(client, raw_changelog_url)
        migration_guide_text = _fetch_text(client, raw_migration_guide_url)
    finally:
        if owns_client:
            client.close()

    return OfficialGuidance(
        changelog_url=changelog_url,
        migration_guide_url=migration_guide_url,
        changelog_text=changelog_text,
        migration_guide_text=migration_guide_text,
    )


def validate_request(state: WorkflowState) -> dict[str, object]:
    request = UpgradeRequest(current_version=state["current_version"])
    return {
        "current_version": request.current_version,
        "current_major": int(request.current_version.split(".", 1)[0]),
        "warnings": [],
    }


def _markdown_sections(markdown: str) -> list[tuple[str, str]]:
    sections: list[tuple[str, list[str]]] = []
    for line in markdown.splitlines():
        if line.startswith("## "):
            sections.append((line[3:].strip().replace("`", ""), []))
        elif sections:
            sections[-1][1].append(line)

    result = []
    for title, lines in sections:
        paragraph: list[str] = []
        for line in lines:
            stripped = line.strip()
            if paragraph and not stripped:
                break
            if stripped and not stripped.startswith(("###", "```")):
                paragraph.append(stripped)
        if paragraph:
            result.append((title, " ".join(paragraph)))
    return result


def _markdown_anchor(title: str) -> str:
    return re.sub(r"[^a-z0-9 -]", "", title.lower()).replace(" ", "-")


def _changelog_warnings(
    markdown: str, major: int, source_url: HttpUrl
) -> tuple[list[BreakingChange], int]:
    changes = []
    heading = ""
    in_target_major = False
    for line in markdown.splitlines():
        if line.startswith("## "):
            heading = line[3:].strip()
            match = re.match(r"(\d+)\.", heading)
            in_target_major = match is not None and int(match.group(1)) == major
            continue
        if in_target_major and "⚠" in line:
            summary = re.sub(r"^\s*[*-]\s*", "", line).replace("⚠️", "").strip()
            title = summary if len(summary) <= 120 else f"{summary[:117]}..."
            changes.append(
                BreakingChange(
                    title=title,
                    summary=summary,
                    source_url=f"{source_url}#{_markdown_anchor(heading)}",
                )
            )

    omitted = max(0, len(changes) - MAX_CHANGELOG_WARNINGS)
    return changes[:MAX_CHANGELOG_WARNINGS], omitted


def extract_breaking_changes(state: WorkflowState) -> dict[str, object]:
    guidance = state.get("guidance")
    if guidance is None or state.get("status") != "upgrade_available":
        return {}

    hints = {
        "minimum python": ["requires-python", "python_requires"],
        "stripeobject": [".get(", ".keys(", ".values(", ".items(", "dict("],
        "decimal fields": ["_decimal", "Decimal("],
    }
    changes = []
    for title, summary in _markdown_sections(guidance.migration_guide_text):
        title_lower = title.lower()
        search_hints = next(
            (values for key, values in hints.items() if key in title_lower), []
        )
        changes.append(
            BreakingChange(
                title=title,
                summary=summary,
                search_hints=search_hints,
                source_url=(
                    f"{guidance.migration_guide_url}#{_markdown_anchor(title)}"
                ),
            )
        )

    changelog_changes, omitted = _changelog_warnings(
        guidance.changelog_text, state["latest_major"], guidance.changelog_url
    )
    changes.extend(changelog_changes)
    if not changes:
        return {
            "status": "source_unavailable",
            "warnings": ["The migration guide contained no breaking-change sections."],
        }
    result: dict[str, object] = {"breaking_changes": changes}
    if omitted:
        result["warnings"] = [
            f"{omitted} additional warning-marked changelog entries were omitted."
        ]
    return result


def build_report(state: WorkflowState) -> dict[str, object]:
    report = MigrationReport(
        status=state.get("status", "source_unavailable"),
        current_version=state["current_version"],
        target_version=state.get("latest_version"),
        breaking_changes=state.get("breaking_changes", []),
        warnings=state.get("warnings", []),
    )
    return {"report": report}


def build_workflow(
    *,
    release_lookup: Callable[[], StripeRelease] = latest_stripe_python_release,
    guidance_lookup: Callable[[str], OfficialGuidance] = fetch_official_guidance,
):
    def fetch_latest_stable_release(state: WorkflowState) -> dict[str, object]:
        try:
            release = release_lookup()
        except ReleaseLookupError:
            return {
                "status": "source_unavailable",
                "warnings": ["The latest stable Stripe release is unavailable."],
            }
        status = (
            "up_to_date"
            if state["current_major"] >= release.major
            else "upgrade_available"
        )
        return {
            "latest_version": release.version,
            "latest_major": release.major,
            "release_url": str(release.release_url),
            "status": status,
        }

    def fetch_guidance(state: WorkflowState) -> dict[str, object]:
        if state.get("status") != "upgrade_available":
            return {}
        try:
            guidance = guidance_lookup(state["latest_version"])
        except GuidanceLookupError:
            return {
                "status": "source_unavailable",
                "warnings": ["Official Stripe migration guidance is unavailable."],
            }
        return {"guidance": guidance}

    builder = StateGraph(WorkflowState)
    builder.add_node("validate_request", validate_request)
    builder.add_node("fetch_latest_stable_release", fetch_latest_stable_release)
    builder.add_node("fetch_official_guidance", fetch_guidance)
    builder.add_node("extract_breaking_changes", extract_breaking_changes)
    builder.add_node("build_report", build_report)
    builder.add_edge(START, "validate_request")
    builder.add_edge("validate_request", "fetch_latest_stable_release")
    builder.add_edge("fetch_latest_stable_release", "fetch_official_guidance")
    builder.add_edge("fetch_official_guidance", "extract_breaking_changes")
    builder.add_edge("extract_breaking_changes", "build_report")
    builder.add_edge("build_report", END)
    return builder.compile()


WORKFLOW = build_workflow()


def analyze_stripe_python_upgrade(
    current_version: str, *, graph=WORKFLOW
) -> MigrationReport:
    state = graph.invoke({"current_version": current_version})
    return state["report"]
