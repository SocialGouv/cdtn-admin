#!/usr/bin/env python3
"""Strip outputs and execution counts from Jupyter notebooks, in place.

Used by the git pre-commit hook so notebooks are versioned *without* their
outputs — no bulky base64 charts, no analytics data leaking into git history.
Pure standard library (no jupyter/uv needed), and it only rewrites a file when
it actually carried outputs, so already-clean notebooks cause no diff churn.

Usage: ``python3 analysis/scripts/strip_nb_outputs.py nb1.ipynb [nb2.ipynb ...]``
   ou: ``python3 analysis/scripts/strip_nb_outputs.py --staged`` (mode pre-commit :
       nettoie les notebooks indexés, côté index *et* worktree).
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


def git(*args: str, stdin: bytes | None = None) -> bytes:
    return subprocess.run(
        ["git", *args], input=stdin, capture_output=True, check=True
    ).stdout


def strip_cells(nb: dict) -> bool:
    """Clear code-cell outputs / execution_count / exec metadata.

    Returns True if the notebook was modified.
    """
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
    return changed


def dump(nb: dict) -> str:
    return json.dumps(nb, indent=1, ensure_ascii=False) + "\n"


def strip(path: Path) -> bool:
    """Strip a notebook on disk, in place. Returns True if it was modified."""
    try:
        nb = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"strip_nb_outputs: skip {path} ({exc})", file=sys.stderr)
        return False

    if not strip_cells(nb):
        return False
    path.write_text(dump(nb), encoding="utf-8")
    print(f"stripped outputs: {path}")
    return True


def strip_staged(path: Path) -> bool:
    """Strip the *indexed* blob of a notebook. Returns True if it was modified.

    The worktree copy may already be clean (e.g. a previous hook run stripped it
    but failed to re-add), so the index has to be rewritten on its own rather
    than via ``git add`` — which would also stage unrelated worktree edits.
    """
    try:
        nb = json.loads(git("show", f":{path}"))
    except (subprocess.CalledProcessError, json.JSONDecodeError) as exc:
        print(f"strip_nb_outputs: skip index {path} ({exc})", file=sys.stderr)
        return False

    if not strip_cells(nb):
        return False

    sha = git("hash-object", "-w", "--stdin", stdin=dump(nb).encode()).decode().strip()
    mode = git("ls-files", "--stage", "--", str(path)).split()[0].decode()
    git("update-index", "--cacheinfo", f"{mode},{sha},{path}")
    print(f"stripped outputs (index): {path}")
    return True


def staged_notebooks() -> list[Path]:
    """Staged notebooks, read NUL-delimited so paths with spaces survive."""
    out = git("diff", "--cached", "--name-only", "-z", "--diff-filter=ACM").decode()
    return [Path(p) for p in out.split("\0") if p.endswith(".ipynb")]


def main(argv: list[str]) -> int:
    if argv[:1] == ["--staged"]:
        for nb in staged_notebooks():
            strip(nb)
            strip_staged(nb)
        return 0

    for arg in argv:
        strip(Path(arg))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
