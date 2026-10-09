"""L2 pipeline, tagging UI: assemble the (plaintext) content that
``tools/encrypt.mjs data`` encrypts for the link-tagging page.

Built from an existing ``{source}_links.json`` (``l2 links recommend`` output)::

    uv run l2 links payload \\
        analysis/output/l2/fiches_service_public_links.json \\
        analysis/output/l2/l2_l1.json analysis/output/l2/docs.csv

writes ``tagging_payload.json`` next to the links file (or ``--out``).

Output JSON ``{links, docs, l2}``:

- ``links``: suggested links (the ``fiches_service_public_links.json`` content)
- ``docs``: directory ``[{s: source, g: slug, i: id, t: title}]``, to resolve a
  code.travail.gouv.fr URL pasted in the UI
- ``l2``: ``{L2 slug -> L1 slug}``, to validate ``/themes/<l1>#<l2>`` URLs

Never publish this file: it is the cleartext of ``links.enc.js``.
"""

from __future__ import annotations

import argparse
import json
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


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("links", type=Path, help="path to {source}_links.json")
    parser.add_argument("l2_l1", type=Path, help="path to l2_l1.json")
    parser.add_argument("docs", type=Path, help="path to docs.csv")
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="output path (default: tagging_payload.json next to the links file)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    links = json.loads(args.links.read_text(encoding="utf-8"))
    out = args.out or args.links.with_name("tagging_payload.json")
    write_payload(links, io.load_l2_l1(args.l2_l1), io.load_docs(args.docs), out)


if __name__ == "__main__":
    main()
