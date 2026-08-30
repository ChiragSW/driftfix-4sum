"""Validated data contracts returned by DriftFix."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator

VERSION_PATTERN = r"^\d+\.\d+\.\d+$"


class DriftFixModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class UpgradeRequest(DriftFixModel):
    current_version: str = Field(pattern=VERSION_PATTERN)


class StripeRelease(DriftFixModel):
    version: str = Field(pattern=VERSION_PATTERN)
    major: int = Field(gt=0)
    published_at: datetime
    release_url: HttpUrl
    prerelease: bool = False

    @model_validator(mode="after")
    def major_matches_version(self) -> "StripeRelease":
        if self.major != int(self.version.split(".", 1)[0]):
            raise ValueError("major must match version")
        return self


class BreakingChange(DriftFixModel):
    title: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    search_hints: list[str] = Field(default_factory=list)
    source_url: HttpUrl


class OfficialGuidance(DriftFixModel):
    changelog_url: HttpUrl
    migration_guide_url: HttpUrl
    changelog_text: str = Field(min_length=1)
    migration_guide_text: str = Field(min_length=1)


class MigrationReport(DriftFixModel):
    status: Literal["upgrade_available", "up_to_date", "source_unavailable"]
    current_version: str = Field(pattern=VERSION_PATTERN)
    target_version: str | None = Field(default=None, pattern=VERSION_PATTERN)
    breaking_changes: list[BreakingChange] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class PullRequestReport(DriftFixModel):
    repository: str = Field(min_length=3)
    number: int = Field(gt=0)
    title: str = Field(min_length=1)
    url: HttpUrl
    state: Literal["open", "merged"]
    draft: bool = False
    author: str = Field(min_length=1)
    head_branch: str = Field(min_length=1)
    base_branch: str = Field(min_length=1)
    body: str = ""
    created_at: datetime
    updated_at: datetime
    merged_at: datetime | None = None
