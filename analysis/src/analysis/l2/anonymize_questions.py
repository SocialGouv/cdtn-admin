"""L2 pipeline, stage 4a (optional): anonymize raw questions before embedding.

Runs before :mod:`analysis.l2.embed_questions` -- deliberately its own
stage (same reasoning as :mod:`analysis.l2.embed_facets` being split from
:mod:`analysis.l2.extract_facets`): the anonymization recipe can change
without re-touching the embedding step, and the raw (un-anonymized) CSV
stays untouched on disk rather than being overwritten in place.

Hybrid approach -- no existing anonymizer to build on in this repo, and no
PII scrubbing happens upstream of this file (checked directly):

- **regex** for structured, high-precision PII: email, phone number, IBAN,
  French social security number ("numéro de sécurité social/NIR"). No
  model needed, deterministic.
- **spaCy NER** (``PER`` entities) for names -- the dominant PII risk in
  this data, which regex can't catch (these are "Madame, Monsieur ... je
  soussigné(e) <name> ... Cordialement, <name>" style free-text
  submissions).

Neither is airtight: NER misses some names and over-flags some common
words as ``PER``; regex only catches what matches its patterns. This is a
real coverage/engineering tradeoff, not a compliance guarantee -- if you
have a specific bar to hit, verify against it rather than trusting this
blindly.

Deliberately does **not** redact dates or locations by default: a date is
usually the legally load-bearing content of these questions (a notice
period, a contract start date), not an identifier -- stripping it would
break the question's meaning, not just anonymize it. Pass
``--redact-locations`` to also strip spaCy's ``LOC``/``GPE`` entities if a
stricter bar is needed (e.g. a small town name that narrows down who
someone is).

Needs the French spaCy model, not installed by default::

    uv run python -m spacy download fr_core_news_md

Run it::

    uv run l2-anonymize-questions questions_raw.csv
    uv run l2-anonymize-questions questions_raw.csv --redact-locations

Then feed the output into :mod:`analysis.l2.embed_questions` unchanged.
No API calls -- pure local regex + spaCy NER.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

import pandas as pd
import spacy
from spacy.language import Language
from spacy.tokens import Doc

_EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PHONE_RE = re.compile(r"(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}")
_IBAN_RE = re.compile(r"\bFR\d{2}(?:\s?\d{4}){5}\s?\d{3}\b", re.IGNORECASE)
# French social security number (NIR): 1 sex digit, 2 year, 2 month
# (01-12 or 20/30/[2A|2B] for special cases), 2-3 département, 3 commune
# order, 3 registry order, 2 checksum -- loosely matched, over-precision
# here just means an occasional false negative, not a false positive risk
# worth tuning further.
_SSN_RE = re.compile(
    r"\b[12]\s?\d{2}\s?(?:0[1-9]|1[0-2])\s?\d{2,3}\s?\d{3}\s?\d{3}\s?\d{2}\b"
)

_SPACY_MODEL = "fr_core_news_md"
_LOC_LABELS = {"LOC", "GPE"}
# fr_core_news_md tags a bare civility title as PER on its own (no name
# attached) often enough in this letter-style corpus ("Madame, Monsieur,")
# that leaving it in would turn a huge, harmless fraction of the corpus
# into noise. A real name is virtually always multi-token ("Monsieur
# Dupont"), so this only filters single-token entities against a small,
# high-confidence list -- it doesn't touch "Monsieur Dupont" itself.
_CIVILITY_TITLES = {
    "madame", "monsieur", "mademoiselle", "mme", "mlle", "m.", "mr", "mrs",
}


def _redact_regex(text: str) -> str:
    text = _EMAIL_RE.sub("[email]", text)
    text = _IBAN_RE.sub("[iban]", text)
    text = _SSN_RE.sub("[numero_secu]", text)
    text = _PHONE_RE.sub("[telephone]", text)
    return text


def _redact_entities(doc: Doc, *, redact_locations: bool) -> str:
    labels = {"PER"} | (_LOC_LABELS if redact_locations else set())
    out = []
    last_end = 0
    for ent in doc.ents:
        if ent.label_ not in labels:
            continue
        if (
            ent.label_ == "PER"
            and len(ent) == 1
            and ent.text.strip(".,").lower() in _CIVILITY_TITLES
        ):
            continue
        out.append(doc.text[last_end : ent.start_char])
        out.append("[personne]" if ent.label_ == "PER" else "[lieu]")
        last_end = ent.end_char
    out.append(doc.text[last_end:])
    return "".join(out)


def anonymize_texts(
    texts: list[str], *, nlp: Language, redact_locations: bool = False
) -> list[str]:
    """Regex first (structured PII), then spaCy NER (names, optionally
    locations). Regex runs first so NER only ever sees text that's already
    had emails/phones/etc. swapped for inert placeholder tokens -- running
    NER first would risk a later regex pass matching inside one of its own
    placeholder substitutions instead of real PII.
    """
    regex_redacted = [_redact_regex(t) for t in texts]
    return [
        _redact_entities(doc, redact_locations=redact_locations)
        for doc in nlp.pipe(regex_redacted)
    ]


def anonymize_questions_df(
    questions_raw: pd.DataFrame,
    *,
    question_col: str = "Question",
    redact_locations: bool = False,
    spacy_model: str = _SPACY_MODEL,
) -> pd.DataFrame:
    nlp = spacy.load(spacy_model)
    out = questions_raw.copy()
    out[question_col] = anonymize_texts(
        out[question_col].astype(str).tolist(),
        nlp=nlp,
        redact_locations=redact_locations,
    )
    return out


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("questions_csv", type=Path, help="raw questions CSV")
    parser.add_argument("--question-col", default="Question")
    parser.add_argument(
        "--redact-locations",
        action="store_true",
        help="also redact spaCy LOC/GPE entities (off by default -- "
        "location mentions are often legally relevant, not identifying)",
    )
    parser.add_argument("--spacy-model", default=_SPACY_MODEL)
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="output path (default: <input>.anonymized.csv)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    out_path = args.out or args.questions_csv.with_name(
        args.questions_csv.stem + ".anonymized.csv"
    )

    questions_raw = pd.read_csv(args.questions_csv)
    print(f"• {len(questions_raw)} raw questions", flush=True)

    print(f"⏳ Anonymizing (regex + spaCy {args.spacy_model})…", flush=True)
    anonymized = anonymize_questions_df(
        questions_raw,
        question_col=args.question_col,
        redact_locations=args.redact_locations,
        spacy_model=args.spacy_model,
    )

    anonymized.to_csv(out_path, index=False)
    print(f"✓ {out_path}")
    print("  Next: uv run l2-embed-questions", out_path)


if __name__ == "__main__":
    main()
