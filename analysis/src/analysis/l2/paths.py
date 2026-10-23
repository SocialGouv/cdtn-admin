"""Where L2 artifacts live by default."""

from __future__ import annotations

from pathlib import Path

# analysis/output/l2 (git-ignored)
OUTPUT_DIR = Path(__file__).resolve().parents[3] / "output" / "l2"
