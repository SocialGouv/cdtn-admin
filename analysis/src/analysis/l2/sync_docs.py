"""L2 pipeline, incremental stage 1: reconcile docs.csv against a fresh
Elasticsearch pull, without re-embedding or re-extracting facets for
documents whose content hasn't actually changed.

:mod:`analysis.l2.build_docs` always does a full ES scan + a full OpenAI
re-embed of every document, every time. That's wasteful once you already
have a docs.csv/facets.csv on disk and just want to pick up what changed
upstream.

The catch: this corpus's document ids are **not stable** across a reimport
-- a bulk content re-sync can reassign every id in a source while the
content itself is byte-identical. A plain id-keyed diff would then read as
"N removed + N new" and pay to re-embed/re-extract N documents that never
actually changed. So every document gets a ``content_hash`` (sha256 of
title+text+breadcrumbs) that survives id churn, and reconciliation matches
on hash first, id second:

- **unchanged** (same id, same hash): row untouched, no API calls.
- **reissued** (same hash, different id -- an unambiguous 1:1 match only):
  the existing embedding and facets carry over under the new id. No API
  calls.
- **changed** (same id, different hash): needs a fresh embedding; its old
  facets rows are dropped so extraction regenerates them.
- **new** (hash matches nothing on record): needs embedding + facet
  extraction from scratch.
- **removed** (old hash/id matches nothing fresh): dropped from both
  tables.

Only ``changed`` + ``new`` ever touch a paid API.

Run it::

    # Free: just report what changed, no writes, no API calls.
    uv run l2-sync-docs analysis/output/l2/docs_openapi.csv \\
        analysis/output/l2/facets.csv --dry-run

    # Apply it: patches docs.csv/facets.csv/l2_l1.json in place.
    uv run l2-sync-docs analysis/output/l2/docs_openapi.csv \\
        analysis/output/l2/facets.csv

Needs ``ELASTICSEARCH_SEARCH_ENGINE_*`` and ``OPENAI_*`` always (content +
embeddings); ``ANTHROPIC_*`` too unless the delta is empty or ``--dry-run``.

Afterwards, ``canonical_facet`` is stale for any changed/new facet rows (and
mildly stale for everyone else, since clustering is corpus-wide) --re-run
``l2-canonicalize-facets`` on the patched ``facets.csv`` before anything
that consumes it.
"""

from __future__ import annotations

import argparse
import hashlib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import pandas as pd

from analysis.connectors.claude import ClaudeClient
from analysis.connectors.elasticsearch import ElasticsearchDocsConnector
from analysis.l2 import io
from analysis.l2.build_docs import assign_l2_l1, embed_documents_chunked
from analysis.l2.embed_facets import embed_facets_df
from analysis.l2.extract_facets import (
    extract_facets_batch,
    extract_facets_for_docs,
    facets_to_df,
)

_CONTENT_HASH_COL = "content_hash"


def content_hash(title: Any, text: Any, breadcrumbs: Any) -> str:
    """Stable, id-independent fingerprint of a document's content."""
    payload = f"{title or ''}\x00{text or ''}\x00{breadcrumbs}".encode()
    return hashlib.sha256(payload).hexdigest()


def add_content_hash(docs_df: pd.DataFrame) -> pd.DataFrame:
    """Backfill ``content_hash`` onto a docs table that predates this column.

    Purely local -- computed from ``title``/``text``/``breadcrumbs`` already
    sitting in the table, so it works even for documents no longer present
    in Elasticsearch.
    """
    docs_df = docs_df.copy()
    docs_df[_CONTENT_HASH_COL] = [
        content_hash(t, x, b)
        for t, x, b in zip(
            docs_df["title"], docs_df["text"], docs_df["breadcrumbs"], strict=True
        )
    ]
    return docs_df


@dataclass
class ReconcileResult:
    unchanged_ids: list[str]
    changed_ids: list[str]
    reissued: dict[str, str]  # old_id -> new_id
    new_docs: list[dict[str, Any]]
    removed_ids: list[str]
    ambiguous_hash_matches: int = field(default=0)

    def summary(self) -> str:
        lines = [
            f"unchanged : {len(self.unchanged_ids)}",
            f"reissued  : {len(self.reissued)}  "
            "(same content, new id -- carried over free)",
            f"changed   : {len(self.changed_ids)}  "
            "(needs embedding + facet re-extraction)",
            f"new       : {len(self.new_docs)}  "
            "(needs embedding + facet extraction)",
            f"removed   : {len(self.removed_ids)}",
        ]
        if self.ambiguous_hash_matches:
            lines.append(
                f"⚠ {self.ambiguous_hash_matches} ambiguous hash match(es) "
                "(duplicate content across ids) -- treated conservatively "
                "as new/removed rather than guessed at"
            )
        n_api_docs = len(self.changed_ids) + len(self.new_docs)
        lines.append(
            f"\n=> {n_api_docs} document(s) need an embedding + facet-extraction call"
        )
        return "\n".join(lines)


def reconcile(
    old_docs_df: pd.DataFrame, fresh_docs: list[dict[str, Any]]
) -> ReconcileResult:
    """Classify every fresh ES document against the existing snapshot.

    ``old_docs_df`` must carry a ``content_hash`` column (see
    :func:`add_content_hash`). Matches by id first; falls back to content
    hash for anything not found under its old id, to catch reissued ids --
    see the module docstring for why that fallback exists.
    """
    old_hash_by_id: dict[str, str] = dict(
        zip(old_docs_df["id"], old_docs_df[_CONTENT_HASH_COL], strict=True)
    )
    fresh_hash_by_id = {
        doc["id"]: content_hash(
            doc.get("title"), doc.get("text"), doc.get("breadcrumbs")
        )
        for doc in fresh_docs
    }

    unchanged_ids: list[str] = []
    changed_ids: list[str] = []
    fresh_new_ids: list[str] = []
    for doc_id, h in fresh_hash_by_id.items():
        if doc_id in old_hash_by_id:
            bucket = unchanged_ids if old_hash_by_id[doc_id] == h else changed_ids
            bucket.append(doc_id)
        else:
            fresh_new_ids.append(doc_id)

    # Old ids genuinely absent from the fresh pull under their own id --
    # candidates for "reissued" (same content, new id) or truly "removed".
    accounted_old_ids = set(unchanged_ids) | set(changed_ids)
    orphaned_old_ids = [i for i in old_hash_by_id if i not in accounted_old_ids]
    orphaned_by_hash: dict[str, list[str]] = {}
    for old_id in orphaned_old_ids:
        orphaned_by_hash.setdefault(old_hash_by_id[old_id], []).append(old_id)

    new_by_hash: dict[str, list[str]] = {}
    for new_id in fresh_new_ids:
        new_by_hash.setdefault(fresh_hash_by_id[new_id], []).append(new_id)

    reissued: dict[str, str] = {}
    new_docs_ids = set(fresh_new_ids)
    consumed_old_ids: set[str] = set()
    ambiguous = 0
    for h, new_ids_for_hash in new_by_hash.items():
        old_ids_for_hash = orphaned_by_hash.get(h, [])
        if not old_ids_for_hash:
            continue
        if len(new_ids_for_hash) == 1 and len(old_ids_for_hash) == 1:
            old_id, new_id = old_ids_for_hash[0], new_ids_for_hash[0]
            reissued[old_id] = new_id
            new_docs_ids.discard(new_id)
            consumed_old_ids.add(old_id)
        else:
            # Duplicate content across multiple ids on one side or the
            # other -- no safe 1:1 match. Leave as new/removed rather than
            # guess which old id maps to which new one.
            ambiguous += len(old_ids_for_hash) + len(new_ids_for_hash)

    removed_ids = [i for i in orphaned_old_ids if i not in consumed_old_ids]
    fresh_by_id = {d["id"]: d for d in fresh_docs}
    new_docs = [fresh_by_id[i] for i in new_docs_ids]

    return ReconcileResult(
        unchanged_ids=unchanged_ids,
        changed_ids=changed_ids,
        reissued=reissued,
        new_docs=new_docs,
        removed_ids=removed_ids,
        ambiguous_hash_matches=ambiguous,
    )


def apply_reconciliation(
    old_docs_df: pd.DataFrame,
    old_facets_df: pd.DataFrame,
    fresh_docs: list[dict[str, Any]],
    result: ReconcileResult,
    client: ClaudeClient,
    *,
    min_docs_per_l2: int = 2,
    use_batch_api: bool = False,
    checkpoint_path: Path,
    checkpoint_every: int = 50,
    poll_interval: float = 60.0,
    sleep_seconds: float = 1.0,
) -> tuple[pd.DataFrame, pd.DataFrame, dict[str, str]]:
    """Patch ``old_docs_df``/``old_facets_df`` per ``result``.

    Returns ``(docs_df, facets_df, l2_to_l1)``, ready for ``io.save_docs``/
    ``io.save_facets``/``io.save_l2_l1``. The only paid API calls made here
    are for ``result.changed_ids`` + ``result.new_docs``.
    """
    fresh_by_id = {d["id"]: d for d in fresh_docs}

    unchanged_df = old_docs_df[old_docs_df["id"].isin(result.unchanged_ids)]

    reissued_rows = []
    for old_id, new_id in result.reissued.items():
        row = old_docs_df.loc[old_docs_df["id"] == old_id].iloc[0].to_dict()
        fresh = fresh_by_id[new_id]
        row.update(
            id=new_id,
            slug=fresh.get("slug"),
            source=fresh.get("source"),
        )
        reissued_rows.append(row)
    reissued_df = pd.DataFrame(reissued_rows, columns=old_docs_df.columns)

    embed_targets = [
        {"id": doc_id, **fresh_by_id[doc_id]} for doc_id in result.changed_ids
    ] + [{"id": d["id"], **d} for d in result.new_docs]

    if embed_targets:
        print(
            f"⏳ OpenAI: embedding {len(embed_targets)} new/changed document(s)…",
            flush=True,
        )
        embedded_df = pd.DataFrame(embed_targets)
        embedded_df["embedding"] = embed_documents_chunked(embed_targets)
        embedded_df[_CONTENT_HASH_COL] = [
            content_hash(d.get("title"), d.get("text"), d.get("breadcrumbs"))
            for d in embed_targets
        ]
    else:
        embedded_df = pd.DataFrame(columns=old_docs_df.columns)

    merged_df = pd.concat(
        [unchanged_df, reissued_df, embedded_df], ignore_index=True
    )
    docs_df, l2_to_l1 = assign_l2_l1(merged_df, min_docs_per_l2=min_docs_per_l2)
    kept_ids = set(docs_df["id"])

    carried_over = old_facets_df[
        old_facets_df["doc_id"].isin(result.unchanged_ids)
    ].copy()
    reissued_facets = old_facets_df[
        old_facets_df["doc_id"].isin(result.reissued)
    ].copy()
    reissued_facets["doc_id"] = reissued_facets["doc_id"].map(result.reissued)
    carried_over = pd.concat([carried_over, reissued_facets], ignore_index=True)

    delta_ids = {d["id"] for d in embed_targets} & kept_ids
    delta_docs_df = docs_df[docs_df["id"].isin(delta_ids)]

    if not delta_docs_df.empty:
        print(
            f"⏳ Claude: extracting facets for {len(delta_docs_df)} document(s)…",
            flush=True,
        )
        if use_batch_api:
            facet_results = extract_facets_batch(
                delta_docs_df,
                l2_to_l1,
                client,
                checkpoint_path,
                checkpoint_every=checkpoint_every,
                poll_interval=poll_interval,
            )
        else:
            facet_results = extract_facets_for_docs(
                delta_docs_df,
                l2_to_l1,
                client,
                sleep_seconds=sleep_seconds,
                checkpoint_path=checkpoint_path,
                checkpoint_every=checkpoint_every,
            )
        raw_new_facets = facets_to_df(facet_results)
        print(f"⏳ OpenAI: embedding {len(raw_new_facets)} new facet(s)…", flush=True)
        new_facets_df = embed_facets_df(raw_new_facets, provider="openai")
        facets_df = pd.concat([carried_over, new_facets_df], ignore_index=True)
    else:
        facets_df = carried_over

    facets_df = facets_df[facets_df["doc_id"].isin(kept_ids)].reset_index(drop=True)
    return docs_df, facets_df, l2_to_l1


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docs", type=Path, help="path to the existing docs.csv")
    parser.add_argument("facets", type=Path, help="path to the existing facets.csv")
    parser.add_argument(
        "--l2-l1",
        type=Path,
        default=None,
        help="output path for l2_l1.json (default: alongside docs.csv)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="only fetch from Elasticsearch and print the reconciliation "
        "counts -- no writes, no embedding/facet-extraction calls",
    )
    parser.add_argument(
        "--min-docs-per-l2",
        type=int,
        default=2,
        help="drop L2 classes with this many member documents or fewer (default: 2)",
    )
    parser.add_argument(
        "--batch",
        action="store_true",
        help="use the Message Batches API for the delta's facet extraction "
        "-- 50%% cheaper, asynchronous",
    )
    parser.add_argument("--poll-interval", type=float, default=60.0)
    parser.add_argument(
        "--checkpoint",
        type=Path,
        default=None,
        help="checkpoint for the delta's facet extraction (default: "
        "alongside facets.csv, sync.checkpoint.json)",
    )
    parser.add_argument("--checkpoint-every", type=int, default=50)
    parser.add_argument("--sleep", type=float, default=1.0)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    l2_l1_path = args.l2_l1 or args.docs.with_name("l2_l1.json")
    checkpoint_path = args.checkpoint or args.facets.with_name("sync.checkpoint.json")

    print("⏳ Loading existing snapshot…", flush=True)
    old_docs_df = io.load_docs(args.docs)
    if _CONTENT_HASH_COL not in old_docs_df.columns:
        print(
            "• Backfilling content_hash onto the existing snapshot "
            "(one-time, local-only)."
        )
        old_docs_df = add_content_hash(old_docs_df)
    old_facets_df = io.load_facets(args.facets)
    print(f"  {len(old_docs_df)} documents, {len(old_facets_df)} facets on record")

    print("\n⏳ Elasticsearch: fetching fresh documents…", flush=True)
    with ElasticsearchDocsConnector() as es:
        fresh_docs = es.fetch_documents()
    print(f"  {len(fresh_docs)} documents in the fresh pull")

    result = reconcile(old_docs_df, fresh_docs)
    print(f"\n=== Delta ===\n{result.summary()}")

    if args.dry_run:
        print("\n(dry run -- nothing written, no API calls made)")
        return

    docs_df, facets_df, l2_to_l1 = apply_reconciliation(
        old_docs_df,
        old_facets_df,
        fresh_docs,
        result,
        ClaudeClient(),
        min_docs_per_l2=args.min_docs_per_l2,
        use_batch_api=args.batch,
        checkpoint_path=checkpoint_path,
        checkpoint_every=args.checkpoint_every,
        poll_interval=args.poll_interval,
        sleep_seconds=args.sleep,
    )

    io.save_docs(docs_df, args.docs)
    io.save_facets(facets_df, args.facets)
    io.save_l2_l1(l2_to_l1, l2_l1_path)
    print(f"\n✓ {args.docs}\n✓ {args.facets}\n✓ {l2_l1_path}")
    print(
        "  Next: uv run l2-canonicalize-facets", args.facets,
        "-- canonical_facet is stale/missing for the patched rows."
    )


if __name__ == "__main__":
    main()
