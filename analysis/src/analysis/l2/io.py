"""On-disk artifacts shared between the L2 pipeline stages.

``docs`` and ``facets`` (the content datasets) are stored as **CSV**, to
match files you may already have on hand (e.g. from the earlier notebooks).
The ``embedding`` column (a list of floats) and, for docs, ``breadcrumbs`` (a
list of dicts) are written via each value's ``repr()`` and read back with
``ast.literal_eval`` -- this is the same encoding the original notebooks
used, fragile in the same way (one malformed cell breaks the column) and
large on disk, but it is what lets a hand-produced CSV drop in directly.

``sessions`` and ``questions`` stay **Parquet**: nothing external hand-crafts
them the way docs/facets sometimes are, so there's no reason to give up
Parquet's smaller size and native list-column support for them.

The L2->L1 label map has no embeddings either way and is kept in this module
too so every pipeline stage reads/writes through the same place.

``load_docs``/``load_facets`` are the dominant cost of every L2 CLI --
``ast.literal_eval``-ing an embedding column back out of CSV text is pure
Python, one cell at a time, and takes well over a minute on the real docs+
facets tables even though the actual scoring work after loading is
sub-second. Each keeps a parquet cache next to its source CSV (``.cache
.parquet`` + a ``.cache.meta.json`` fingerprint of the source's size/mtime)
so a second load of the same, unchanged CSV skips ``literal_eval`` entirely
via parquet's native list-column support. The CSV stays the source of
truth -- a hand-edit changes its size/mtime, which invalidates the cache
automatically -- the cache is purely a derived speedup, never committed
(see .gitignore) and safe to delete any time.
"""

from __future__ import annotations

import json
from ast import literal_eval
from pathlib import Path

import pandas as pd

# Columns whose values are embedding vectors: normalized to plain Python lists
# before writing, so every writer produces the same ``repr()`` shape
# (parseable by ``ast.literal_eval``) regardless of whether it built the
# column from a numpy array, a DataFrame row, or a list.
_EMBEDDING_COLUMNS = ("embedding",)


def _cache_paths(path: Path) -> tuple[Path, Path]:
    """(parquet cache, its freshness sidecar) for a CSV source, next to it."""
    return (
        path.with_name(path.name + ".cache.parquet"),
        path.with_name(path.name + ".cache.meta.json"),
    )


def _source_fingerprint(path: Path) -> dict:
    stat = path.stat()
    return {"size": stat.st_size, "mtime_ns": stat.st_mtime_ns}


def _delistify(df: pd.DataFrame) -> pd.DataFrame:
    """Parquet round-trips a Python-list cell back as a numpy array, not a
    list -- ``str()``/``repr()`` of the two render completely differently
    (``array([...], dtype=object)`` vs ``[...]``), which silently breaks any
    caller that content-hashes or string-compares these columns depending on
    whether the cache happened to be warm. Coerce back to plain lists so the
    cache is actually transparent, matching the direct CSV+literal_eval path.
    """
    df = df.copy()
    for col in (*_EMBEDDING_COLUMNS, "breadcrumbs"):
        if col in df.columns:
            df[col] = df[col].apply(lambda v: list(v) if v is not None else None)
    return df


def _load_cached(path: Path) -> pd.DataFrame | None:
    """The parquet cache for ``path``, if present and matching its source CSV.

    Any problem reading the cache (missing sidecar, corrupt parquet, a stale
    fingerprint) just means "no cache" -- the caller falls back to the CSV,
    which is always correct, just slower.
    """
    cache_path, meta_path = _cache_paths(path)
    if not cache_path.exists() or not meta_path.exists():
        return None
    try:
        fingerprint_matches = json.loads(meta_path.read_text()) == _source_fingerprint(
            path
        )
    except (json.JSONDecodeError, OSError):
        return None
    if not fingerprint_matches:
        return None
    try:
        return _delistify(pd.read_parquet(cache_path))
    except Exception:
        return None


def _write_cache(df: pd.DataFrame, path: Path) -> None:
    """Best-effort: a read-only dir or missing parquet engine shouldn't fail
    the load."""
    cache_path, meta_path = _cache_paths(path)
    try:
        df.to_parquet(cache_path, index=False)
        meta_path.write_text(json.dumps(_source_fingerprint(path)))
    except Exception:
        pass


def _listify_embeddings(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in _EMBEDDING_COLUMNS:
        if col in df.columns:
            # float(x), not just list(v): a numpy array's elements are numpy
            # scalars, and numpy>=2.0 reprs those as "np.float64(...)" --
            # unparseable by ast.literal_eval. Native floats always repr as
            # a bare number.
            df[col] = df[col].apply(
                lambda v: [float(x) for x in v] if v is not None else None
            )
    return df


def save_docs(docs_df: pd.DataFrame, path: str | Path) -> None:
    """Write the documents table (id, title, text, slug, source, breadcrumbs,
    embedding, l2, ...) to ``path`` as CSV."""
    _listify_embeddings(docs_df).to_csv(path, index=False)


def load_docs(path: str | Path) -> pd.DataFrame:
    path = Path(path)
    cached = _load_cached(path)
    if cached is not None:
        return cached
    df = pd.read_csv(path)
    df["embedding"] = df["embedding"].apply(literal_eval)
    if "breadcrumbs" in df.columns:
        df["breadcrumbs"] = df["breadcrumbs"].apply(literal_eval)
    _write_cache(df, path)
    return df


def save_facets(facets_df: pd.DataFrame, path: str | Path) -> None:
    """Write the facets table (doc_id, text, type, salience, embedding) to
    ``path`` as CSV."""
    _listify_embeddings(facets_df).to_csv(path, index=False)


def load_facets(path: str | Path) -> pd.DataFrame:
    path = Path(path)
    cached = _load_cached(path)
    if cached is not None:
        return cached
    df = pd.read_csv(path)
    df["embedding"] = df["embedding"].apply(literal_eval)
    _write_cache(df, path)
    return df


def save_facets_raw(facets_df: pd.DataFrame, path: str | Path) -> None:
    """Write the un-embedded facets table (doc_id, text, type, salience) to
    ``path`` as CSV -- :mod:`analysis.l2.facets.extract`'s output, before
    :mod:`analysis.l2.facets.embed` attaches an ``embedding`` column."""
    facets_df.to_csv(path, index=False)


def load_facets_raw(path: str | Path) -> pd.DataFrame:
    return pd.read_csv(path)


def save_questions(questions_df: pd.DataFrame, path: str | Path) -> None:
    """Write the questions table (id, text, embedding) to ``path``."""
    _listify_embeddings(questions_df).to_parquet(path, index=False)


def load_questions(path: str | Path) -> pd.DataFrame:
    return pd.read_parquet(path)


def save_sessions(sessions: list[list[str]], path: str | Path) -> None:
    """Write co-click sessions (a list of doc-id lists) to ``path``."""
    pd.DataFrame({"session": sessions}).to_parquet(path, index=False)


def load_sessions(path: str | Path) -> list[list[str]]:
    return pd.read_parquet(path)["session"].apply(list).tolist()


def save_l2_l1(l2_to_l1: dict[str, str], path: str | Path) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(l2_to_l1, f, indent=2, ensure_ascii=False)


def load_l2_l1(path: str | Path) -> dict[str, str]:
    with open(path, encoding="utf-8") as f:
        return json.load(f)
