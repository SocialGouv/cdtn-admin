"""L2 pipeline, stage 2: documents -> raw facets (LLM extraction, no embeddings).

For every document, asks Claude to extract salience-scored "facets"
(entities/topics/claims, redefined below for droit-du-travail content) — a
much finer-grained signal than the document's own embedding, used by
:mod:`analysis.l2.signatures` to build per-type facet centroids and by
:mod:`analysis.l2.use_cases` for the facet-bridge evidence behind
complementary-L2 suggestions. Each document's own L2/L1 (already assigned by
:mod:`analysis.l2.build_docs`) is injected into the prompt as context, for
free, to prime the model with the right vocabulary before it reads the text.

The requested facet count (see :func:`facet_count_range`) scales with
document length rather than staying fixed at 4-8: a long, broad reference
document (a several-thousand-word fiche covering many sub-topics) was
getting the same facet budget as a short, single-purpose one, so a
sub-topic it clearly discusses could still lose out to competing content
for one of only ~8 slots -- confirmed directly on real documents (a
renewal-of-trial-period fiche's own facets never surfaced plain
"renouvellement de la période d'essai", crowded out by 8 other sub-topics,
even though a narrow letter template entirely about that renewal makes it
its own top facet). Short documents keep exactly today's 4-8 range; only
documents long enough to need more get it.

Deliberately decoupled from embedding (:mod:`analysis.l2.embed_facets`
handles that, as its own stage): this step is the slow, LLM-driven one, so
splitting it out means trying a different embedding provider/model never
requires re-running it.

**This is slow**: one LLM call per document, roughly one document per second
including the deliberate rate-limit pause below — a few thousand documents is
a multi-hour run. Progress is checkpointed to disk every
``--checkpoint-every`` documents (``--checkpoint``, default alongside ``--out``)
and resumed automatically on restart, so a crash or an interrupted run does
not throw away hours of LLM calls.

``--batch`` (see :func:`extract_facets_batch`) uses the Message Batches API
instead: same prompt, same model, 50% cheaper per token, but asynchronous
(usually under an hour; up to 24h) rather than ~1 doc/sec. Worth it whenever
the run doesn't need to finish *right now* -- which, given it already takes
hours synchronously, is close to always. The in-flight batch id is itself
checkpointed, so a crash while waiting resumes the same batch instead of
paying for a second one.

Output: ``facets_raw.csv`` (doc_id, text, type, salience) -- no embedding
column; see :mod:`analysis.l2.embed_facets` for the next stage.

Run it::

    uv run python -m analysis.l2.extract_facets \\
        analysis/output/l2/docs.csv \\
        analysis/output/l2/l2_l1.json

    # skip one or more sources entirely, e.g. the dominant one
    uv run python -m analysis.l2.extract_facets \\
        analysis/output/l2/docs.csv \\
        analysis/output/l2/l2_l1.json \\
        --exclude-source fiches_ministere_travail

    # 50% cheaper, asynchronous
    uv run python -m analysis.l2.extract_facets \\
        analysis/output/l2/docs.csv \\
        analysis/output/l2/l2_l1.json \\
        --batch

Needs ``ANTHROPIC_*`` settings in ``.env``.
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Literal, TypedDict

import pandas as pd
from tqdm import tqdm

from analysis.connectors.albert import strip_code_fences
from analysis.connectors.claude import ClaudeClient
from analysis.l2 import io

# Today's fixed range, kept as the floor for every document regardless of
# length -- a short document shouldn't get fewer facets than before.
_BASE_MIN_FACETS = 4
_BASE_MAX_FACETS = 8
# One facet per this many characters once a document is long enough to
# exceed _BASE_MAX_FACETS at that rate -- chosen from the actual chars/facet
# ratio short, single-purpose documents already get under the base range
# (roughly 1 per 100-450 chars); 1,500 stays well short of that so long
# documents still get comparatively sparser, higher-level coverage, just not
# as extreme as today's flat cap.
_CHARS_PER_EXTRA_FACET = 1500
# Safety ceiling so an extreme outlier (the longest fiche in the corpus is
# tens of thousands of characters) doesn't ask for an unreasonable facet
# count or blow past the model's practical output length.
_MAX_FACETS_CEILING = 20


def facet_count_range(text: str) -> tuple[int, int]:
    """How many facets to request for a document this long: ``(min, max)``.

    Stays at today's ``(4, 8)`` for anything short enough that 8 was never
    actually a binding constraint; scales ``max`` up for longer documents
    so a real sub-topic doesn't lose out to competing content purely for
    lack of slots -- see the module docstring for the concrete case this
    was measured against.
    """
    scaled_max = round(len(text) / _CHARS_PER_EXTRA_FACET)
    max_facets = max(_BASE_MAX_FACETS, min(_MAX_FACETS_CEILING, scaled_max))
    return _BASE_MIN_FACETS, max_facets


PROMPT_TEMPLATE = """\
Vous extrayez des facettes indexables à partir d'un document du site
code.travail.gouv.fr (droit du travail français : fiches pratiques, modèles
de courriers, outils, contributions). Ces facettes serviront à retrouver
D'AUTRES documents du site qui abordent une procédure, un dispositif ou une
règle similaire sous un angle différent — pas à résumer ce document.

Ce document est classé dans la rubrique « {l2} » (rattachée au thème « {l1} »).

Titre : {title}

Document :
\"\"\"
{text}
\"\"\"

Extrayez entre {min_facets} et {max_facets} facettes : procédures,
dispositifs légaux nommés, acteurs, ou règles/conditions précises qu'un
usager pourrait chercher ailleurs sur le site à propos d'une situation
différente.

Consignes :
- Visez un niveau de spécificité MOYEN, propre au droit du travail. Trop
  large ("droit du travail", "les congés", "le licenciement") : à éviter.
  Trop précis, unique à ce document ("l'arrêt maladie de ce salarié débuté
  en janvier 2026") : à éviter aussi. Niveau attendu : "indemnité de
  licenciement pour motif économique", "préavis de démission", "cumul
  emploi-retraite", "temps partiel thérapeutique" — des formulations qui
  pourraient réapparaître, avec des mots proches, dans 2 à 3 autres fiches,
  contributions ou modèles sans rapport direct avec celui-ci.{coverage_hint}
- Classez chaque facette dans l'un de ces trois types :
    "entity" : un dispositif, une institution ou une référence légale
      nommée (ex. "l'activité partielle", "France Travail", "l'AGS", "le
      conseil de prud'hommes", "la convention collective Syntec", un
      article du Code du travail cité explicitement).
    "topic"  : un mécanisme ou une procédure récurrente en droit du travail
      (ex. "rupture conventionnelle", "période d'essai", "arrêt de travail
      pour maladie professionnelle").
    "claim"  : une règle, condition ou seuil précis énoncé dans le document
      (ex. "le préavis de démission dépend de l'ancienneté du salarié", "un
      salarié en CDD ne peut être licencié que pour faute grave").
- Pour chaque facette, un score de saillance (1 à 5) : à quel point elle est
  centrale à la question traitée par le document, par opposition à une
  mention incidente.
- N'incluez pas de facette qui ne fait que reformuler le sujet global du
  document — chaque facette doit être un fil distinct, exploitable
  indépendamment.
- Résolvez les références vagues ("l'employeur", "ce dispositif", "cette
  procédure", "il") vers leur véritable référent avant de produire la
  facette.

Produisez UNIQUEMENT du JSON valide, sans préambule, sans balises markdown,
respectant ce schéma :

{{
  "facets": [
    {{
      "text": "chaîne de caractères, la formulation de la facette",
      "type": "entity" | "topic" | "claim",
      "salience": 1-5
    }}
  ]
}}
"""


class Facet(TypedDict):
    text: str
    type: Literal["entity", "topic", "claim"]
    salience: int


# Exceptions raised by a malformed (but HTTP-successful) LLM response --
# shared between the single-call retry loop and the batch parser, neither
# of which should catch anything broader than "this specific response was
# unusable."
_MALFORMED_RESPONSE_ERRORS = (
    json.JSONDecodeError,
    KeyError,
    AssertionError,
    TypeError,
    ValueError,
)


def build_prompt(title: str, text: str, l2: str, l1: str) -> str:
    """The exact prompt :func:`extract_facets` and :func:`extract_facets_batch`
    both send -- factored out so the batch path can't silently drift from
    the single-call one.
    """
    min_facets, max_facets = facet_count_range(text)
    coverage_hint = (
        "\n- Ce document est plus long que la moyenne et couvre probablement "
        "plusieurs procédures ou dispositifs distincts. Pour CHAQUE "
        "sous-thème traité en détail (pas seulement mentionné en passant), "
        'incluez au moins une facette de type "topic" qui le nomme en '
        'termes généraux (ex. "renouvellement de la période d\'essai"), '
        'même si vous ajoutez aussi, séparément, une facette "claim" plus '
        "précise sur une condition ou un seuil de ce même sous-thème -- ne "
        "vous limitez pas à la version la plus spécifique. Utilisez au "
        f"besoin les {max_facets} facettes disponibles pour cette "
        "couverture, plutôt que de vous arrêter au minimum."
        if max_facets > _BASE_MAX_FACETS
        else ""
    )
    return PROMPT_TEMPLATE.format(
        title=title,
        text=text,
        l2=l2,
        l1=l1,
        min_facets=min_facets,
        max_facets=max_facets,
        coverage_hint=coverage_hint,
    )


def _parse_facets_json(response_text: str) -> list[Facet]:
    """Parse+validate one LLM response into facets, or raise one of
    :data:`_MALFORMED_RESPONSE_ERRORS`.
    """
    cleaned = strip_code_fences(response_text)
    facets = json.loads(cleaned)["facets"]
    for f in facets:
        assert isinstance(f["text"], str)
        assert f["type"] in ("entity", "topic", "claim")
        assert 1 <= int(f["salience"]) <= 5
    return facets


def extract_facets(
    title: str,
    text: str,
    l2: str,
    l1: str,
    client: ClaudeClient,
    *,
    max_retries: int = 2,
) -> list[Facet]:
    """Extract this document's facets. Retries on a malformed LLM response."""
    prompt = build_prompt(title, text, l2, l1)

    last_error: Exception | None = None
    last_response = ""
    for _ in range(max_retries + 1):
        last_response = client.generate(prompt)
        try:
            return _parse_facets_json(last_response)
        except _MALFORMED_RESPONSE_ERRORS as e:
            last_error = e
            continue

    raise ValueError(
        f"Impossible d'obtenir un JSON valide après {max_retries + 1} tentative(s). "
        f"Dernière erreur : {last_error}. Réponse brute : {last_response!r}"
    )


def _load_checkpoint(path: Path) -> dict[str, list[Facet]]:
    if not path.exists():
        return {}
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def _save_checkpoint(results: dict[str, list[Facet]], path: Path) -> None:
    tmp = path.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False)
    tmp.replace(path)


def extract_facets_for_docs(
    docs_df: pd.DataFrame,
    l2_to_l1: dict[str, str],
    client: ClaudeClient,
    *,
    doc_id_col: str = "id",
    l2_col: str = "l2",
    sleep_seconds: float = 1.0,
    checkpoint_path: Path | None = None,
    checkpoint_every: int = 50,
) -> dict[str, list[Facet]]:
    """Extract facets for every document, resuming from ``checkpoint_path`` if present.

    ``sleep_seconds`` between calls is a deliberate rate limit, not a retry
    backoff — Claude is a shared instance. Transient HTTP failures (rate
    limits, overload) are already retried inside
    :meth:`analysis.connectors.claude.ClaudeClient.generate`; if a document
    still fails after those retries are exhausted (or its LLM response never
    becomes valid JSON), it's logged and skipped rather than aborting the
    whole run -- it's simply absent from the returned dict, so it's picked
    back up automatically the next time this is called against the same
    checkpoint.
    """
    results = _load_checkpoint(checkpoint_path) if checkpoint_path else {}
    remaining = docs_df[~docs_df[doc_id_col].astype(str).isin(results)]
    if results:
        print(f"• Resuming from checkpoint: {len(results)} documents already done.")

    since_checkpoint = 0
    n_failed = 0
    for row in tqdm(
        remaining.itertuples(), total=len(remaining), desc="Extracting facets"
    ):
        doc_id = str(getattr(row, doc_id_col))
        l2 = getattr(row, l2_col)
        l1 = l2_to_l1.get(l2, "")
        try:
            results[doc_id] = extract_facets(row.title, row.text, l2, l1, client)
        except Exception as e:
            n_failed += 1
            tqdm.write(f"⚠ {doc_id}: {e} -- skipped, will retry on next run")
            time.sleep(sleep_seconds)
            continue

        since_checkpoint += 1
        if checkpoint_path and since_checkpoint >= checkpoint_every:
            _save_checkpoint(results, checkpoint_path)
            since_checkpoint = 0
        time.sleep(sleep_seconds)

    if checkpoint_path and since_checkpoint:
        _save_checkpoint(results, checkpoint_path)
    if n_failed:
        print(f"⚠ {n_failed} document(s) failed after retries -- re-run to retry them.")
    return results


# Batches API limit -- see extract_facets_batch. The corpus this pipeline
# targets (a few thousand documents at most) is nowhere near it, so this is
# a fail-fast boundary check, not something worth chunking for.
_MAX_BATCH_REQUESTS = 100_000


def _batch_state_path(checkpoint_path: Path) -> Path:
    """Sidecar next to the checkpoint recording an in-flight batch id, so a
    crash while polling resumes that batch instead of submitting (and
    paying for) a second one for the same documents.
    """
    return checkpoint_path.with_suffix(".batch_state.json")


def _load_batch_state(checkpoint_path: Path) -> dict | None:
    path = _batch_state_path(checkpoint_path)
    if not path.exists():
        return None
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def _save_batch_state(checkpoint_path: Path, batch_id: str) -> None:
    with _batch_state_path(checkpoint_path).open("w", encoding="utf-8") as f:
        json.dump({"batch_id": batch_id}, f)


def _clear_batch_state(checkpoint_path: Path) -> None:
    path = _batch_state_path(checkpoint_path)
    if path.exists():
        path.unlink()


def extract_facets_batch(
    docs_df: pd.DataFrame,
    l2_to_l1: dict[str, str],
    client: ClaudeClient,
    checkpoint_path: Path,
    *,
    doc_id_col: str = "id",
    l2_col: str = "l2",
    max_tokens: int = 1024,
    checkpoint_every: int = 200,
    poll_interval: float = 60.0,
) -> dict[str, list[Facet]]:
    """Extract facets via the Message Batches API -- 50% cheaper per token
    than :func:`extract_facets_for_docs`'s one-call-at-a-time loop, at the
    cost of asynchronous completion (usually under an hour; up to 24h).
    Same prompt (:func:`build_prompt`) and response parsing
    (:func:`_parse_facets_json`) as the synchronous path -- only how the
    calls are made differs.

    Unlike the synchronous path, ``checkpoint_path`` isn't optional here:
    besides resuming already-extracted documents, it's also where the
    in-flight batch id is recorded (in a
    ``<checkpoint_path>.batch_state.json`` sidecar) the moment the batch is
    submitted -- so if this crashes while polling, re-running it resumes
    that same batch rather than submitting a second one for the same
    documents. A malformed response or a non-"succeeded" result
    (``errored``/``canceled``/``expired``) is logged and skipped exactly
    like a failure in the synchronous path: absent from the returned dict,
    picked up automatically by re-running against the same checkpoint.
    """
    results = _load_checkpoint(checkpoint_path)
    remaining = docs_df[~docs_df[doc_id_col].astype(str).isin(results)]
    if results:
        print(f"• Resuming from checkpoint: {len(results)} documents already done.")
    if remaining.empty:
        return results

    batch_state = _load_batch_state(checkpoint_path)
    if batch_state:
        batch_id = batch_state["batch_id"]
        print(f"• Resuming in-flight batch {batch_id} (found in checkpoint state).")
    else:
        if len(remaining) > _MAX_BATCH_REQUESTS:
            raise ValueError(
                f"{len(remaining)} requests exceeds the Batches API's "
                f"{_MAX_BATCH_REQUESTS:,}-request limit -- split into "
                "multiple batches (not implemented here; not expected at "
                "this pipeline's corpus size)."
            )
        requests = [
            {
                "custom_id": str(getattr(row, doc_id_col)),
                "params": {
                    "model": client.model,
                    "max_tokens": max_tokens,
                    "messages": [
                        {
                            "role": "user",
                            "content": build_prompt(
                                row.title,
                                row.text,
                                getattr(row, l2_col),
                                l2_to_l1.get(getattr(row, l2_col), ""),
                            ),
                        }
                    ],
                },
            }
            for row in remaining.itertuples()
        ]
        print(f"⏳ Submitting a batch of {len(requests)} requests…", flush=True)
        batch = client.create_batch(requests)
        batch_id = batch["id"]
        _save_batch_state(checkpoint_path, batch_id)
        print(f"✓ batch {batch_id} submitted ({batch['processing_status']})")

    while True:
        batch = client.get_batch(batch_id)
        status = batch["processing_status"]
        counts = batch["request_counts"]
        print(
            f"  {status}: {counts['succeeded']} succeeded, "
            f"{counts['errored']} errored, {counts['processing']} processing, "
            f"{counts['canceled']} canceled, {counts['expired']} expired",
            flush=True,
        )
        if status == "ended":
            break
        time.sleep(poll_interval)

    n_failed = 0
    since_checkpoint = 0
    for line in client.iter_batch_results(batch["results_url"]):
        doc_id = line["custom_id"]
        result = line["result"]
        if result["type"] == "succeeded":
            text = "".join(
                b["text"] for b in result["message"]["content"] if b["type"] == "text"
            )
            try:
                results[doc_id] = _parse_facets_json(text)
            except _MALFORMED_RESPONSE_ERRORS as e:
                n_failed += 1
                print(f"⚠ {doc_id}: malformed response ({e}) -- skipped")
                continue
        else:
            n_failed += 1
            print(f"⚠ {doc_id}: batch result {result['type']!r} -- skipped")
            continue

        since_checkpoint += 1
        if since_checkpoint >= checkpoint_every:
            _save_checkpoint(results, checkpoint_path)
            since_checkpoint = 0

    if since_checkpoint:
        _save_checkpoint(results, checkpoint_path)
    _clear_batch_state(checkpoint_path)
    if n_failed:
        print(f"⚠ {n_failed} document(s) failed -- re-run to retry them.")
    return results


def facets_to_df(results: dict[str, list[Facet]]) -> pd.DataFrame:
    """Flatten ``{doc_id: [facet, ...]}`` into one row per facet.

    No embeddings here -- see :mod:`analysis.l2.embed_facets`.
    """
    rows = [
        {"doc_id": doc_id, **facet}
        for doc_id, facets in results.items()
        for facet in facets
    ]
    return pd.DataFrame(rows, columns=["doc_id", "text", "type", "salience"])


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "docs", type=Path, help="path to docs.csv (analysis.l2.build_docs output)"
    )
    parser.add_argument(
        "l2_l1", type=Path, help="path to l2_l1.json (analysis.l2.build_docs output)"
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="output path for facets_raw.csv (default: alongside docs.csv)",
    )
    parser.add_argument(
        "--checkpoint",
        type=Path,
        default=None,
        help="checkpoint JSON path, resumed automatically if present "
        "(default: <out>.checkpoint.json)",
    )
    parser.add_argument(
        "--checkpoint-every",
        type=int,
        default=50,
        help="save the checkpoint every N documents (default: 50)",
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=1.0,
        help="seconds to sleep between LLM calls (default: 1.0)",
    )
    parser.add_argument(
        "--exclude-source",
        action="append",
        dest="exclude_sources",
        default=[],
        help="skip documents from this source, e.g. fiches_ministere_travail "
        "(repeatable)",
    )
    parser.add_argument(
        "--batch",
        action="store_true",
        help="use the Message Batches API instead of one call at a time -- "
        "50%% cheaper, but asynchronous (usually under an hour; up to 24h) "
        "instead of ~1 doc/sec",
    )
    parser.add_argument(
        "--poll-interval",
        type=float,
        default=60.0,
        help="--batch only: seconds between status checks while waiting for "
        "the batch to finish (default: 60.0)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    out_path = args.out or args.docs.with_name("facets_raw.csv")
    checkpoint_path = args.checkpoint or out_path.with_suffix(".checkpoint.json")

    docs_df = io.load_docs(args.docs)
    l2_to_l1 = io.load_l2_l1(args.l2_l1)

    if args.exclude_sources:
        before = len(docs_df)
        docs_df = docs_df[~docs_df["source"].isin(args.exclude_sources)]
        print(
            f"• Excluding {', '.join(args.exclude_sources)}: "
            f"{before - len(docs_df)} document(s) skipped"
        )
    client = ClaudeClient()
    if args.batch:
        print(
            f"• {len(docs_df)} documents to process via the Batches API "
            "(50% cheaper, usually under an hour)."
        )
        results = extract_facets_batch(
            docs_df,
            l2_to_l1,
            client,
            checkpoint_path,
            checkpoint_every=args.checkpoint_every,
            poll_interval=args.poll_interval,
        )
    else:
        print(
            f"• {len(docs_df)} documents to process (⚠ ~1 LLM call/doc, "
            "several hours)."
        )
        results = extract_facets_for_docs(
            docs_df,
            l2_to_l1,
            client,
            sleep_seconds=args.sleep,
            checkpoint_path=checkpoint_path,
            checkpoint_every=args.checkpoint_every,
        )

    facets_df = facets_to_df(results)
    io.save_facets_raw(facets_df, out_path)
    print(f"\n✓ {len(facets_df)} facets across {len(results)} documents")
    print(f"✓ {out_path}")
    print("  Next: uv run l2-embed-facets", out_path)

    if len(results) < len(docs_df):
        print(
            f"⚠ {len(docs_df) - len(results)} document(s) still missing -- "
            f"checkpoint kept at {checkpoint_path}, re-run this same command "
            "to pick them up."
        )
    elif checkpoint_path.exists():
        checkpoint_path.unlink()


if __name__ == "__main__":
    main()
