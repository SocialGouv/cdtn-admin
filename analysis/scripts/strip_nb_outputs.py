#!/usr/bin/env python3
"""Strip outputs and execution counts from Jupyter notebooks, in place.

Used by the git pre-commit hook so notebooks are versioned *without* their
outputs — no bulky base64 charts, no analytics data leaking into git history.
Pure standard library (no jupyter/uv needed), and it only rewrites a file when
it actually carried outputs, so already-clean notebooks cause no diff churn.

Usage: ``python3 analysis/scripts/strip_nb_outputs.py nb1.ipynb [nb2.ipynb ...]``
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


def strip(path: Path) -> bool:
    """Clear code-cell outputs / execution_count / exec metadata in place.

    Returns True if the file was modified.
    """
    try:
        nb = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"strip_nb_outputs: skip {path} ({exc})", file=sys.stderr)
        return False

    changed = False
    for cell in nb.get("cells", []):
        if cell.get("cell_type") != "code":
            continue
        if cell.get("outputs"):
            cell["outputs"] = []
            changed = True
        if cell.get("execution_count") is not None:
            cell["execution_count"] = None
            changed = True
        if cell.get("metadata", {}).pop("execution", None) is not None:
            changed = True

    if changed:
        path.write_text(
            json.dumps(nb, indent=1, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        print(f"stripped outputs: {path}")
    return changed


def main(argv: list[str]) -> int:
    for arg in argv:
        strip(Path(arg))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
