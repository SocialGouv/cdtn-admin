"""L2 pipeline, stage 2c (optional): canonicalize near-duplicate facet phrasings.

Facets are extracted independently per document, so the same real-world
concept often comes out worded slightly differently across documents (e.g.
"préavis de démission" vs "délai de préavis en cas de démission"). Right now
:func:`analysis.l2.signatures.top_recurring_facets` groups by literal text
and :func:`analysis.l2.facet_index.facet_bridge_pairs` matches via cosine
similarity on raw phrasings, so near-identical concepts don't get credited
as the same thing.

This clusters facet embeddings (deduplicated by lowercased text) with
agglomerative clustering on a cosine-similarity threshold -- merging is a
near-duplicate/paraphrase-detection problem, not a density-based one, so a
hard similarity cutoff is a better fit than density clustering (HDBSCAN was
tried first and, verified directly, fails to merge even an obvious close
pair on small/sparse data -- it's built to find variable-density clusters,
not paraphrases). Every unique phrasing gets a ``canonical_facet``: the
member of its cluster closest to the cluster centroid. A phrasing with no
close match ends up alone in its own cluster and keeps its own text.

Purely additive: adds one column to ``facets.csv``, doesn't touch
``embedding``/``text``/``type``/``salience``. Existing consumers can opt into
grouping by the canonical label via their existing ``text_col`` parameter
(e.g. ``top_recurring_facets(facets_df, doc_ids, text_col="canonical_facet")``)
-- no code changes required there.

Run it::

    uv run l2 facets canonicalize analysis/output/l2/facets.csv
    uv run l2 facets canonicalize analysis/output/l2/facets.csv \\
        --similarity-threshold 0.9

No credentials needed -- pure clustering over already-computed embeddings.
Run it after :mod:`analysis.l2.facets.embed`, before any stage that consumes
``facets.csv``.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import AgglomerativeClustering

from analysis.l2 import io
from analysis.l2.config import (
    CANONICAL_CLUSTER_THRESHOLD as DEFAULT_SIMILARITY_THRESHOLD,
)
from analysis.l2.signatures.core import l2_normalize, stack_embeddings


def canonicalize_facets(
    facets_df: pd.DataFrame,
    *,
    similarity_threshold: float = DEFAULT_SIMILARITY_THRESHOLD,
) -> pd.DataFrame:
    """Add a ``canonical_facet`` column, grouping near-duplicate phrasings.

    Clustering runs once per *unique* lowercased facet text (not once per
    row) -- the same text said by 500 documents is one clustering input, not
    500, then the result is broadcast back to every row via a text lookup.
    Two phrasings merge when their average-linkage cosine similarity is at
    least ``similarity_threshold``; higher is stricter (fewer merges).
    """
    lower_text = facets_df["text"].str.lower()
    unique = facets_df.loc[~lower_text.duplicated(keep="first")].reset_index(drop=True)
    unique_lower = unique["text"].str.lower()

    if len(unique) < 2:
        return facets_df.assign(canonical_facet=facets_df["text"])

    embeddings = l2_normalize(stack_embeddings(unique["embedding"]))
    clustering = AgglomerativeClustering(
        n_clusters=None,
        distance_threshold=1 - similarity_threshold,
        metric="cosine",
        linkage="average",
    )
    labels = clustering.fit_predict(embeddings)

    canonical_by_lower: dict[str, str] = {}
    for label in np.unique(labels):
        member_idx = np.where(labels == label)[0]
        cluster_embeddings = embeddings[member_idx]
        centroid = l2_normalize(cluster_embeddings.mean(axis=0, keepdims=True))[0]
        medoid_idx = member_idx[np.argmax(cluster_embeddings @ centroid)]
        medoid_text = unique["text"].iloc[medoid_idx]
        for i in member_idx:
            canonical_by_lower[unique_lower.iloc[i]] = medoid_text

    out = facets_df.copy()
    out["canonical_facet"] = lower_text.map(canonical_by_lower)
    return out


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("facets", type=Path, help="path to facets.csv")
    parser.add_argument(
        "--similarity-threshold",
        type=float,
        default=DEFAULT_SIMILARITY_THRESHOLD,
        help=f"cosine similarity above which two phrasings merge "
        f"(default: {DEFAULT_SIMILARITY_THRESHOLD})",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="output path (default: overwrite the input facets.csv in place "
        "-- this only adds a column)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    out_path = args.out or args.facets

    facets_df = io.load_facets(args.facets)
    n_unique = facets_df["text"].str.lower().nunique()
    print(f"⏳ Clustering {n_unique} unique facet texts…", flush=True)
    out = canonicalize_facets(facets_df, similarity_threshold=args.similarity_threshold)

    unique_pairs = out.assign(_lower=out["text"].str.lower()).drop_duplicates("_lower")
    cluster_sizes = unique_pairs.groupby("canonical_facet")["_lower"].nunique()
    n_singletons = int((cluster_sizes == 1).sum())
    print(
        f"✓ {n_unique} unique phrasings -> {len(cluster_sizes)} canonical facets "
        f"({n_singletons} singletons, no close match found)"
    )

    io.save_facets(out, out_path)
    print(f"✓ {out_path}")


if __name__ == "__main__":
    main()
