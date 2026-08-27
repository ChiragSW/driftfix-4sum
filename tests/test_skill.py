from pathlib import Path


def test_driftfix_skill_keeps_required_harness_guards() -> None:
    text = (Path(__file__).parents[1] / "agent" / "SKILL.md").read_text(
        encoding="utf-8"
    )

    assert text.startswith("---\nname: driftfix\n")
    assert len(text) < 5_000
    for required in (
        "TrueForge must execute and trace",
        "Impact Scout",
        "Migration Reviewer",
        "Daytona sandbox",
        "Never write to the default branch",
        "human approval",
    ):
        assert required in text
