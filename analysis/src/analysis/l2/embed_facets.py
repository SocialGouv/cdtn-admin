"""L2 pipeline, stage 2b: embed extracted facets.

Deliberately its own stage, decoupled from extraction
(:mod:`analysis.l2.extract_facets`): that step is the slow, LLM-driven one
(hours), this one is a batch of embedding calls (minutes). Splitting them
means trying a different embedding provider/model against the exact same
extracted facet texts never requires re-running the extraction.

Input: ``facets_raw.csv`` (doc_id, text, type, salience) --
:mod:`analysis.l2.extract_facets` output.
Output: ``facets.csv`` (doc_id, text, type, salience, embedding) -- consumed
by every later stage.

Facet texts repeat heavily across documents (short entity/topic phrases);
each occurrence still gets its own embedding call -- cheap relative to the
LLM extraction -- but the result is deduplicated by lowercased text before
being mapped back onto every row, so a repeated phrase always resolves to
exactly one vector.

Run it::

    uv run l2-embed-facets analysis/output/l2/facets_raw.csv
    uv run l2-embed-facets analysis/output/l2/facets_raw.csv --provider albert

Needs ``OPENAI_*`` (default provider) or ``ALBERT_*`` settings in ``.env``,
matching ``--provider``. Use the same provider you embedded ``docs.csv``
with -- :mod:`analysis.l2.signatures` computes cosine similarity between
docs and facets, which is only meaningful in a shared embedding space.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

from analysis.connectors.albert import embed_texts as albert_embed_texts
from analysis.connectors.openai import embed_texts as openai_embed_texts
from analysis.l2 import io

_PROVIDERS = {
    "openai": openai_embed_texts,
    "albert": albert_embed_texts,
}


def embed_facets_df(
    facets_raw_df: pd.DataFrame, *, provider: str = "openai"
) -> pd.DataFrame:
    """Attach an ``embedding`` column to a raw facets table.

    Duplicate facet texts (very common) share one embedding, looked up by
    lowercased text -- same dedup contract as
    :func:`analysis.connectors.albert.embed_texts` itself already applies
    when lowercasing, made explicit here across repeated *rows* too.
    """
    if facets_raw_df.empty:
        return facets_raw_df.assign(embedding=[])

    embed_texts = _PROVIDERS[provider]
    embeddings = embed_texts(facets_raw_df["text"].tolist())
    embeddings = embeddings[~embeddings.index.duplicated(keep="first")]
    facets_df = facets_raw_df.copy()
    facets_df["embedding"] = (
        facets_df["text"].str.lower().map(embeddings.apply(list, axis=1))
    )
    return facets_df


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "facets_raw",
        type=Path,
        help="path to facets_raw.csv (analysis.l2.extract_facets output)",
    )
    parser.add_argument(
        "--provider",
        choices=sorted(_PROVIDERS),
        default="openai",
        help="embedding provider (default: openai)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="output path for facets.csv (default: alongside facets_raw.csv)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    out_path = args.out or args.facets_raw.with_name("facets.csv")

    facets_raw_df = io.load_facets_raw(args.facets_raw)
    print(f"⏳ {args.provider}: embedding {len(facets_raw_df)} facets…", flush=True)
    facets_df = embed_facets_df(facets_raw_df, provider=args.provider)

    io.save_facets(facets_df, out_path)
    print(f"✓ {len(facets_df)} facets embedded")
    print(f"✓ {out_path}")


if __name__ == "__main__":
    main()
