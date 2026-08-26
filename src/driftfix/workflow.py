"""Deterministic Stripe release discovery and migration workflow pieces."""

import os
import re
from datetime import datetime
from urllib.parse import urlsplit

import httpx
from pydantic import BaseModel, ConfigDict, HttpUrl, ValidationError

from .schemas import OfficialGuidance, StripeRelease

GITHUB_RELEASE_URL = "https://api.github.com/repos/stripe/stripe-python/releases"
STRIPE_RELEASE_PREFIX = "https://github.com/stripe/stripe-python/releases/"
VERSION_TAG = re.compile(r"^v?(\d+)\.(\d+)\.(\d+)$")
MAX_SOURCE_BYTES = 2_000_000
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
