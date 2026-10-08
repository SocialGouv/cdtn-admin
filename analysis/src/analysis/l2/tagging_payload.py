"""L2 pipeline, tagging UI: assemble the (plaintext) content that
``tools/encrypt.mjs data`` encrypts for the link-tagging page.

Normally produced by :mod:`analysis.l2.recommend_links` in the same step as
the links themselves (``tagging_payload.json`` next to them); this module
also runs standalone on an existing links file::

    uv run python -m analysis.l2.tagging_payload \\
        analysis/output/l2/fiches_service_public_links.json \\
        analysis/output/l2/l2_l1.json analysis/output/l2/docs.csv \\
        analysis/output/l2/tagging_payload.json

Output JSON ``{links, docs, l2}``:

- ``links``: suggested links (the ``fiches_service_public_links.json`` content)
- ``docs``: directory ``[{s: source, g: slug, i: id, t: title}]``, to resolve a
  code.travail.gouv.fr URL pasted in the UI
- ``l2``: ``{L2 slug -> L1 slug}``, to validate ``/themes/<l1>#<l2>`` URLs

Never publish this file: it is the cleartext of ``links.enc.js``.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd

from analysis.l2 import io


def build_payload(
    links: list[dict], l2_to_l1: dict[str, str], docs_df: pd.DataFrame
) -> dict:
    docs = [
        {"s": r.source, "g": r.slug, "i": r.id, "t": r.title}
        for r in docs_df.itertuples()
        if r.slug and r.id
    ]
    # Any suggested document must be findable, even if absent from docs_df.
    known = {(d["s"], d["g"]) for d in docs}
    for doc in links:
        for link in doc["links"]:
            if link.get("candidate_type") != "document":
                continue
            key = (link["candidate_source"], link["candidate_slug"])
            if key not in known:
                known.add(key)
                docs.append(
                    {
                        "s": key[0],
                        "g": key[1],
                        "i": link["candidate_id"],
                        "t": link["candidate_label"],
                    }
                )
    return {"links": links, "docs": docs, "l2": l2_to_l1}


def write_payload(
    links: list[dict],
    l2_to_l1: dict[str, str],
    docs_df: pd.DataFrame,
    path: Path,
) -> Path:
    payload = build_payload(links, l2_to_l1, docs_df)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(
        f"✓ {path} ({len(payload['links'])} fiches, {len(payload['docs'])} "
        f"documents, {len(l2_to_l1)} L2) -- cleartext, never publish"
    )
    return path


def main(argv: list[str] | None = None) -> None:
    args = sys.argv[1:] if argv is None else argv
    if len(args) != 4:
        raise SystemExit(
            "usage: python -m analysis.l2.tagging_payload "
            "<links.json> <l2_l1.json> <docs.csv> <out.json>"
        )
    links_path, l2_l1_path, docs_path, out_path = map(Path, args)
    links = json.loads(links_path.read_text(encoding="utf-8"))
    write_payload(links, io.load_l2_l1(l2_l1_path), io.load_docs(docs_path), out_path)


if __name__ == "__main__":
    main()
