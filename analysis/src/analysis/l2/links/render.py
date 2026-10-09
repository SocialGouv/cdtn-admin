"""JSON export of the links table (the single output format of ``l2 links recommend``)."""

from __future__ import annotations

import numpy as np
import pandas as pd

# --------------------------------------------------------------------------- #
# JSON export
# --------------------------------------------------------------------------- #


def _json_safe(value):
    """A cell value, made JSON-serializable: NaN/NaT -> ``None`` (``json.dumps``
    otherwise emits a bare ``NaN`` token, which is not valid JSON and
    ``JSON.parse`` rejects outright), numpy scalars (``int64``, ``float64``,
    ...) -> the equivalent native Python type (``json.dumps`` raises on
    those directly).
    """
    if pd.isna(value):
        return None
    if isinstance(value, np.generic):
        return value.item()
    return value


# Every per-link field from _OUTPUT_COLUMNS except the source_* ones, which
# are hoisted onto the parent document object instead of repeated on each
# link.
_LINK_JSON_COLUMNS = [
    "candidate_type",
    "combined_rank",
    "rank_within_type",
    "confidence",
    "candidate_id",
    "candidate_label",
    "candidate_slug",
    "candidate_source",
    "candidate_l2",
    "candidate_l1",
    "source_affinity",
    "n_shared_canonical_facets",
    "shared_canonical_facets",
    "embedding_similarity",
    "combined_score",
]


# Conceptually integers, but the source column is float64 in practice: a
# "no candidates" placeholder row (see build_links_table) leaves these NaN
# for that source document, which upcasts the whole column from int64.
# Safe to force back to int here -- by the time a row reaches this
# function it's a real candidate, never that placeholder.
_LINK_INT_COLUMNS = {"combined_rank", "rank_within_type", "n_shared_canonical_facets"}


def _json_link_value(row: pd.Series, col: str):
    value = _json_safe(row[col])
    return int(value) if value is not None and col in _LINK_INT_COLUMNS else value


_DOC_JSON_COLUMNS = [
    "source_doc_id",
    "source_slug",
    "source_title",
    "source_source",
    "source_l2",
    "source_l1",
    "source_canonical_facets",
]


def to_links_json(table: pd.DataFrame) -> list[dict]:
    """:func:`build_links_table`'s output as one object per source
    document, each with a ``links`` array -- meant for a consumer that
    applies these as real links on the live documents; carries the full
    detail (both candidate types, every scoring ingredient), just reshaped from one flat table into one object per
    source document.

    Both candidate types are included, distinguished by ``candidate_type``
    (``"document"`` or ``"l2"``), sorted together by ``combined_rank`` --
    the one blended ranking both types are scored on together (see
    :func:`combined_score`). An L2 candidate has no ``candidate_slug``/
    ``candidate_source`` (``null``) since it isn't a single page -- its
    ``candidate_id`` *is* the L2's own slug (also mirrored onto
    ``candidate_l2`` so that field is never null either way), and paired
    with ``candidate_l1`` a consumer that wants to link to the theme page
    can build ``/themes/{candidate_l1}#{candidate_id}`` itself.

    A source document with no qualifying candidate still gets an entry
    with an empty ``links`` list, not a dropped one -- a consumer that
    fully replaces a document's links on each run needs to see it to know
    to clear them, not just no longer be told.
    """
    if table.empty:
        return []

    docs = []
    headers = table.drop_duplicates("source_doc_id")[_DOC_JSON_COLUMNS]
    for _, header in headers.iterrows():
        doc_id = header["source_doc_id"]
        doc_rows = table[
            (table["source_doc_id"] == doc_id) & table["candidate_id"].notna()
        ].sort_values("combined_rank")

        links = [
            {col: _json_link_value(r, col) for col in _LINK_JSON_COLUMNS}
            for _, r in doc_rows.iterrows()
        ]
        doc_entry = {col: _json_safe(header[col]) for col in _DOC_JSON_COLUMNS}
        doc_entry["links"] = links
        docs.append(doc_entry)
    return docs
