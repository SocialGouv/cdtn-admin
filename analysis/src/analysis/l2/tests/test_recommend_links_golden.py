"""Golden/characterization test for the links recommender.

Runs build_links_table on a small seeded synthetic corpus and compares the
JSON export against a committed snapshot. Refactors must keep it identical;
regenerate deliberately with ``UPDATE_GOLDEN=1 uv run pytest tests/l2``.
"""

import json
import os
from pathlib import Path

import numpy as np
import pandas as pd

from analysis.l2.links.recommend import (
    build_links_table,
    to_links_json,
)

GOLDEN = Path(__file__).parent / "golden_links.json"
DIM = 8
L2_TO_L1 = {"a1": "A", "a2": "A", "b1": "B", "b2": "B"}
TOPICS = ["congés", "salaire", "contrat", "retraite", "licenciement", "formation"]


def _unit(v):
    return v / np.linalg.norm(v)


def _corpus():
    rng = np.random.default_rng(42)
    centers = {l2: _unit(rng.normal(size=DIM)) for l2 in L2_TO_L1}
    facet_vecs = {t: _unit(rng.normal(size=DIM)) for t in TOPICS}
    docs, facets = [], []
    for l2 in L2_TO_L1:
        for i in range(8):
            source = "fiches_service_public" if i < 5 else "modeles_de_documents"
            doc_id = f"{l2}-{i}"
            docs.append(
                {
                    "id": doc_id,
                    "title": f"Doc {doc_id}",
                    "slug": f"doc-{doc_id}",
                    "source": source,
                    "l2": l2,
                    "embedding": _unit(centers[l2] + rng.normal(0, 0.4, DIM)),
                }
            )
            for t in rng.choice(TOPICS, size=3, replace=False):
                facets.append(
                    {
                        "doc_id": doc_id,
                        "text": t,
                        "canonical_facet": t,
                        "type": rng.choice(["topic", "entity", "claim"]),
                        "salience": int(rng.integers(1, 4)),
                        "embedding": facet_vecs[t],
                    }
                )
    return pd.DataFrame(docs), pd.DataFrame(facets)


def _round(x):
    if isinstance(x, float):
        return round(x, 6)
    if isinstance(x, dict):
        return {k: _round(v) for k, v in x.items()}
    if isinstance(x, list):
        return [_round(v) for v in x]
    return x


def test_links_table_matches_golden():
    docs, facets = _corpus()
    table = build_links_table(
        docs,
        facets,
        L2_TO_L1,
        source="fiches_service_public",
        target_sources=("modeles_de_documents",),
        min_similarity=0.3,
    )
    links = _round(to_links_json(table))
    assert links, "fixture should yield at least one link"

    if os.environ.get("UPDATE_GOLDEN") or not GOLDEN.exists():
        GOLDEN.write_text(json.dumps(links, ensure_ascii=False, indent=1))
    assert links == json.loads(GOLDEN.read_text())
