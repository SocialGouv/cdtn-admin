"""L2 use case 3 on its own: embedded questions -> matched L2 / L1 themes.

Needs only the signature inputs (docs, facets, l2_l1) and the embedded
questions.

Run it::

    uv run l2 questions theme \\
        output/l2/docs.csv output/l2/facets.csv output/l2/l2_l1.json \\
        output/l2/questions.parquet --top-k 3 --sample 2000

Output: ``questions_themes.json`` only, ``{questions: [{id, t, m: [[l2, score],
...]}], l2: {l2 -> l1}}`` -- the cleartext of ``tools/questions.enc.js`` for the
question-theming tab of the tagging UI (see ``tools/README.md``). ``--sample N``
keeps N random questions (fixed seed; default 0 = all). Never publish this
file.

No credentials needed. ``questions.parquet`` must come from
:mod:`analysis.l2.questions.embed` with the same provider as ``docs.csv``.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

from analysis.l2 import io
from analysis.l2.paths import OUTPUT_DIR
from analysis.l2.signatures.core import (
    L2Signature,
    build_l2_signatures,
    l2_normalize,
    stack_embeddings,
)


def add_question_l2_columns(
    questions_df: pd.DataFrame,
    signatures: dict[str, L2Signature],
    embedding_col: str = "embedding",
    top_k: int = 2,
    with_scores: bool = False,
) -> pd.DataFrame:
    """
    Use case 3. Adds matched_l2_1 ... matched_l2_{top_k} to a copy of
    questions_df (plus matched_l2_{k}_score, the cosine similarity, when
    ``with_scores``). Fully vectorized -- one matrix multiply against the
    L2 signatures, no per-row loop, since questions already carry
    precomputed embeddings.
    """
    l2s = list(signatures.keys())
    sig_matrix = l2_normalize(np.vstack([signatures[l2].vector for l2 in l2s]))
    q_matrix = l2_normalize(stack_embeddings(questions_df[embedding_col]))
    sims = q_matrix @ sig_matrix.T  # (n_questions, n_l2)

    top_idx = np.argsort(-sims, axis=1)[:, :top_k]
    out = questions_df.copy()
    for k in range(top_k):
        out[f"matched_l2_{k + 1}"] = [l2s[i] for i in top_idx[:, k]]
        if with_scores:
            out[f"matched_l2_{k + 1}_score"] = sims[np.arange(len(sims)), top_idx[:, k]]
    return out


def theme_questions(
    questions_df: pd.DataFrame,
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    l2_to_l1: dict[str, str],
    *,
    top_k: int = 2,
    doc_id_col: str = "id",
    l2_col: str = "l2",
) -> pd.DataFrame:
    """Return a copy of ``questions_df`` with ``matched_l2_{k}`` and
    ``matched_l1_{k}`` columns for k in 1..top_k."""
    signatures = build_l2_signatures(
        docs_df, facets_df, l2_to_l1, doc_id_col=doc_id_col, l2_col=l2_col
    )
    out = add_question_l2_columns(
        questions_df, signatures, top_k=top_k, with_scores=True
    )
    for k in range(1, top_k + 1):
        out[f"matched_l1_{k}"] = out[f"matched_l2_{k}"].map(l2_to_l1)
    return out


def build_questions_payload(
    themed: pd.DataFrame,
    l2_to_l1: dict[str, str],
    *,
    sample: int = 0,
    seed: int = 0,
) -> dict:
    """``{questions: [{id, t, m: [[l2, score], ...]}], l2}`` for the tagging UI.

    ``sample`` random questions (0 = all), kept in a stable (id-sorted) order.
    """
    if sample and sample < len(themed):
        themed = themed.sample(n=sample, random_state=seed)
    themed = themed.sort_values("id")
    top_k = sum(c.startswith("matched_l2_") and c[-1].isdigit() for c in themed.columns)
    questions = [
        {
            "id": str(row["id"]),
            "t": row["text"],
            "m": [
                [row[f"matched_l2_{k}"], round(float(row[f"matched_l2_{k}_score"]), 4)]
                for k in range(1, top_k + 1)
            ],
        }
        for _, row in themed.iterrows()
    ]
    return {"questions": questions, "l2": l2_to_l1}


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docs", type=Path, help="path to docs.csv")
    parser.add_argument("facets", type=Path, help="path to facets.csv")
    parser.add_argument("l2_l1", type=Path, help="path to l2_l1.json")
    parser.add_argument("questions", type=Path, help="path to questions.parquet")
    parser.add_argument("--top-k", type=int, default=2, help="themes per question")
    parser.add_argument(
        "--sample",
        type=int,
        default=0,
        metavar="N",
        help="keep N random questions (default: 0 = all)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=OUTPUT_DIR,
        help="output directory for questions_themes.json",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    l2_to_l1 = io.load_l2_l1(args.l2_l1)
    themed = theme_questions(
        io.load_questions(args.questions),
        io.load_docs(args.docs),
        io.load_facets(args.facets),
        l2_to_l1,
        top_k=args.top_k,
    )
    payload = build_questions_payload(themed, l2_to_l1, sample=args.sample)
    args.out.mkdir(parents=True, exist_ok=True)
    path = args.out / "questions_themes.json"
    path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(
        f"✓ {len(payload['questions'])} questions -> {path} (cleartext, never publish)"
    )


if __name__ == "__main__":
    main()
