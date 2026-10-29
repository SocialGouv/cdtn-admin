import pytest

pytest.importorskip("spacy")

from analysis.l2.questions.anonymize import _redact_regex  # noqa: E402


@pytest.mark.parametrize(
    "raw, placeholder",
    [
        ("écrire à jean.dupont@example.fr svp", "[email]"),
        ("appelez le 06 12 34 56 78", "[telephone]"),
        ("IBAN FR76 3000 6000 0112 3456 7890 189", "[iban]"),
    ],
)
def test_regex_redacts_structured_pii(raw, placeholder):
    out = _redact_regex(raw)
    assert placeholder in out
    assert "dupont" not in out and "06 12" not in out and "3000" not in out
