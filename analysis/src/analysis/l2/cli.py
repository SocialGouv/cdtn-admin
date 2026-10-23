"""``l2`` command line: one entry point, one subcommand per pipeline step.

    uv run l2 --help
    uv run l2 docs build ...

Each subcommand delegates to the ``main(argv)`` of its module, which owns its
own arguments (``uv run l2 links recommend --help``). Modules are imported
lazily so ``l2 --help`` stays instant and a step's heavy dependencies (spaCy,
sklearn, ...) are only loaded when that step runs.
"""

from __future__ import annotations

import importlib
import sys

# (group, command) -> (module, one-line description). Ordered as the pipeline.
COMMANDS: dict[tuple[str, str], tuple[str, str]] = {
    ("docs", "build"): ("analysis.l2.docs.build", "ES docs + embeddings -> docs.csv"),
    ("docs", "sync"): ("analysis.l2.docs.sync", "incremental update of docs/facets"),
    ("facets", "extract"): ("analysis.l2.facets.extract", "Claude facet extraction"),
    ("facets", "embed"): ("analysis.l2.facets.embed", "embed facets -> facets.csv"),
    ("facets", "canonicalize"): (
        "analysis.l2.facets.canonicalize",
        "cluster facets -> canonical_facet",
    ),
    ("sessions", "build"): (
        "analysis.l2.sessions.build",
        "Matomo visits -> sessions.parquet",
    ),
    ("questions", "anonymize"): (
        "analysis.l2.questions.anonymize",
        "redact PII from raw questions",
    ),
    ("questions", "embed"): (
        "analysis.l2.questions.embed",
        "embed questions -> questions.parquet",
    ),
    ("questions", "theme"): (
        "analysis.l2.questions.theme",
        "assign top-k L2/L1 themes to questions",
    ),
    ("describe", ""): (
        "analysis.l2.signatures.describe",
        "Claude-written description per L2",
    ),
    ("links", "recommend"): (
        "analysis.l2.links.recommend",
        "cross-link recommendations (json/md)",
    ),
    ("links", "payload"): (
        "analysis.l2.links.payload",
        "links json -> tagging UI payload (cleartext)",
    ),
    ("links", "explain"): (
        "analysis.l2.links.explain",
        "why a link was / wasn't recommended",
    ),
    ("links", "fit-weights"): (
        "analysis.l2.links.fit_weights",
        "fit score weights from tagged votes",
    ),
    ("audit", ""): (
        "analysis.l2.audit.run",
        "misclassification + complementary L2 Excel review",
    ),
}


def _usage() -> str:
    lines = ["usage: l2 <step> [<command>] [options]", "", "steps:"]
    for (group, command), (_, desc) in COMMANDS.items():
        name = f"{group} {command}".strip()
        lines.append(f"  {name:<22} {desc}")
    lines += ["", "Run `l2 <step> [<command>] --help` for a step's options."]
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> None:
    argv = list(sys.argv[1:] if argv is None else argv)
    if not argv or argv[0] in ("-h", "--help"):
        print(_usage())
        return

    group = argv[0]
    if (group, "") in COMMANDS:
        key, rest = (group, ""), argv[1:]
    elif len(argv) > 1 and (group, argv[1]) in COMMANDS:
        key, rest = (group, argv[1]), argv[2:]
    else:
        print(f"l2: unknown step {' '.join(argv[:2])!r}\n", file=sys.stderr)
        print(_usage(), file=sys.stderr)
        raise SystemExit(2)

    module = importlib.import_module(COMMANDS[key][0])
    module.main(rest)


if __name__ == "__main__":
    main()
