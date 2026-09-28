"""L2 pipeline, extra stage: a public-facing description for every L2 class.

For each L2 (sub-theme), asks Claude for two things about what a visitor to
code.travail.gouv.fr will find under it -- a short sentence description, and
a standalone list of keywords/main concepts -- grounded in the class's most
representative documents
(:func:`analysis.l2.signatures.top_representative_docs`) and its most
recurring topics/entities (:func:`analysis.l2.signatures.top_recurring_facets`),
so the wording reflects the class's actual content rather than just
paraphrasing its slug.

Unlike the rest of the pipeline (which uses Albert throughout), this stage
calls Claude directly over raw HTTP
(:class:`analysis.connectors.claude.ClaudeClient`) -- no ``anthropic`` SDK
dependency, same interface as :class:`analysis.connectors.albert.AlbertClient`.

These are **drafts for editorial review**, not copy to publish automatically
-- output is one row per L2 (l2, l1, n_docs, description, keywords) as
``.xlsx``, same review-first convention as the rest of the pipeline.

Run it::

    uv run l2-describe-classes \\
        analysis/output/l2/docs.csv \\
        analysis/output/l2/facets.csv \\
        analysis/output/l2/l2_l1.json

Needs ``ANTHROPIC_*`` settings in ``.env``.
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import TypedDict

import pandas as pd
from tqdm import tqdm

from analysis.connectors.albert import strip_code_fences
from analysis.connectors.claude import ClaudeClient
from analysis.l2 import io
from analysis.l2.signatures import (
    L2Signature,
    build_l2_signatures,
    score_against_signatures,
    top_recurring_facets,
    top_representative_docs,
)

PROMPT_TEMPLATE = """\
Vous rédigez le contenu d'une rubrique thématique du site
code.travail.gouv.fr, à destination des visiteurs du site.

Rubrique : {l2}

Titres de documents représentatifs de cette rubrique :
{doc_titles}

Sujets qui reviennent le plus souvent dans cette rubrique :
{facets}
{contrastive_section}
Produisez deux éléments à partir de ce qui précède, en français :

1. "description" : une description de cette rubrique en 1 phrase, pour
   un·e visiteur·se du site qui hésite à cliquer dessus : qu'y trouvera-t-il
   concrètement ? Appuyez-vous sur les titres et sujets ci-dessus pour
   refléter le contenu réel de la rubrique, sans vous limiter à reformuler
   son nom. Langage direct, EVITE la formulation rédigée, de type "Cette
   rubrique décrit concrètement", "Vous trouverez"... Ton neutre et
   informatif, sans jargon juridique inutile, sans familiarité. Maximum 100
   caractères.
2. "keywords" : une liste de 5 à 10 mots-clés ou expressions courtes (2-3
   mots maximum chacune) résumant les principaux concepts de cette rubrique
   -- pour un usage de type tags, pas une phrase. Dédupliquez les variantes
   proches (ex. ne gardez pas à la fois "licenciement économique" et
   "licenciement pour motif économique").

Produisez UNIQUEMENT du JSON valide, sans préambule, sans balises markdown,
respectant ce schéma :

{{
  "description": "...",
  "keywords": ["...", "..."]
}}
"""

# Inserted only when a contrastive neighbor is available -- see
# find_nearest_neighbor. Kept separate from PROMPT_TEMPLATE's numbered
# instructions so disabling contrastive mode doesn't change their wording.
_CONTRASTIVE_TEMPLATE = """
Pour distinguer cette rubrique d'une rubrique proche mais différente,
évitez de choisir des mots-clés qui se confondent avec les sujets suivants
(ils appartiennent à cette autre rubrique) :
{neighbor_facets}
"""


class ClassDescription(TypedDict):
    description: str
    keywords: list[str]


def build_description_prompt(
    l2: str,
    doc_titles: list[str],
    facet_texts: list[str],
    *,
    contrastive_facet_texts: list[str] | None = None,
) -> str:
    contrastive_section = (
        _CONTRASTIVE_TEMPLATE.format(
            neighbor_facets="\n".join(f"- {t}" for t in contrastive_facet_texts)
        )
        if contrastive_facet_texts
        else ""
    )
    return PROMPT_TEMPLATE.format(
        l2=l2,
        doc_titles="\n".join(f"- {t}" for t in doc_titles),
        facets="\n".join(f"- {t}" for t in facet_texts),
        contrastive_section=contrastive_section,
    )


def find_nearest_neighbor(
    l2: str, signature: L2Signature, signatures: dict[str, L2Signature]
) -> str | None:
    """The L2 whose signature is most similar to this one's, excluding itself.

    Reuses the same cosine-similarity primitive as use case 1
    (:func:`analysis.l2.signatures.score_against_signatures`) -- cheap
    (one matrix multiply over however many L2 classes there are), no extra
    LLM call. ``None`` when there's no other class to compare against.
    """
    ranked = score_against_signatures(signature.vector, signatures)
    ranked = ranked[ranked["l2"] != l2]
    return ranked.iloc[0]["l2"] if not ranked.empty else None


def parse_description_response(raw: str) -> ClassDescription:
    """Parse the model's ``{"description": ..., "keywords": [...]}`` reply."""
    parsed = json.loads(strip_code_fences(raw))
    description = parsed["description"]
    keywords = parsed["keywords"]
    assert isinstance(description, str)
    assert isinstance(keywords, list)
    assert all(isinstance(k, str) for k in keywords)
    return {"description": description, "keywords": keywords}


def describe_l2(
    l2: str,
    signature: L2Signature,
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    client: ClaudeClient,
    *,
    doc_id_col: str = "id",
    top_n_docs: int = 6,
    top_n_facets: int = 8,
    facet_types: tuple = ("topic", "entity"),
    max_retries: int = 2,
    contrastive: bool = True,
    signatures: dict[str, L2Signature] | None = None,
    top_n_contrastive_facets: int = 6,
) -> ClassDescription:
    """One L2's public-facing description + keywords.

    Grounded in its representative documents and recurring facets. When
    ``contrastive`` is true and ``signatures`` is given, also grounds the
    prompt in the nearest neighboring L2's recurring facets, so the model
    can avoid picking keywords that collide with a similar-but-distinct
    class -- see :func:`find_nearest_neighbor`. Retries on a malformed LLM
    response, same JSON contract as
    :func:`analysis.l2.extract_facets.extract_facets`.
    """
    reps = top_representative_docs(
        docs_df,
        signature.kept_doc_ids,
        signature.doc_centroid,
        top_n=top_n_docs,
        doc_id_col=doc_id_col,
    )
    doc_titles = reps["title"].tolist() if "title" in reps.columns else []

    typed_facets = facets_df[facets_df["type"].isin(facet_types)]
    recurring = top_recurring_facets(
        typed_facets, signature.kept_doc_ids, top_n=top_n_facets
    )
    facet_texts = (
        recurring.sort_values("score", ascending=False)
        .head(top_n_facets)["text"]
        .tolist()
    )

    contrastive_facet_texts = None
    if contrastive and signatures and len(signatures) > 1:
        neighbor_l2 = find_nearest_neighbor(l2, signature, signatures)
        if neighbor_l2 is not None:
            neighbor_recurring = top_recurring_facets(
                typed_facets,
                signatures[neighbor_l2].kept_doc_ids,
                top_n=top_n_contrastive_facets,
            )
            contrastive_facet_texts = (
                neighbor_recurring.sort_values("score", ascending=False)
                .head(top_n_contrastive_facets)["text"]
                .tolist()
            )

    prompt = build_description_prompt(
        l2, doc_titles, facet_texts, contrastive_facet_texts=contrastive_facet_texts
    )

    last_error: Exception | None = None
    last_response = ""
    for _ in range(max_retries + 1):
        last_response = client.generate(prompt)
        try:
            return parse_description_response(last_response)
        except (
            json.JSONDecodeError,
            KeyError,
            AssertionError,
            TypeError,
            ValueError,
        ) as e:
            last_error = e
            continue

    raise ValueError(
        f"Impossible d'obtenir un JSON valide après {max_retries + 1} tentative(s). "
        f"Dernière erreur : {last_error}. Réponse brute : {last_response!r}"
    )


def describe_all(
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    signatures: dict[str, L2Signature],
    client: ClaudeClient,
    *,
    top_n_docs: int = 6,
    top_n_facets: int = 8,
    sleep_seconds: float = 1.0,
    contrastive: bool = True,
) -> pd.DataFrame:
    """One description + keyword list per L2 signature, one LLM call each."""
    rows = []
    for l2, signature in tqdm(signatures.items(), desc="Describing L2 classes"):
        result = describe_l2(
            l2,
            signature,
            docs_df,
            facets_df,
            client,
            top_n_docs=top_n_docs,
            top_n_facets=top_n_facets,
            contrastive=contrastive,
            signatures=signatures,
        )
        rows.append(
            {
                "l2": l2,
                "l1": signature.l1,
                "n_docs": signature.n_docs,
                "description": result["description"],
                "keywords": ", ".join(result["keywords"]),
            }
        )
        time.sleep(sleep_seconds)
    return pd.DataFrame(rows)


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docs", type=Path, help="path to docs.csv")
    parser.add_argument("facets", type=Path, help="path to facets.csv")
    parser.add_argument("l2_l1", type=Path, help="path to l2_l1.json")
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parents[3] / "output" / "l2",
        help="output directory for l2_descriptions.xlsx",
    )
    parser.add_argument(
        "--top-docs",
        type=int,
        default=6,
        help="representative docs per L2 (default: 6)",
    )
    parser.add_argument(
        "--top-facets", type=int, default=8, help="recurring facets per L2 (default: 8)"
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=1.0,
        help="seconds between LLM calls (default: 1.0)",
    )
    parser.add_argument(
        "--no-contrastive",
        action="store_false",
        dest="contrastive",
        help="don't ground the prompt in the nearest neighboring L2's facets "
        "(contrastive grounding is on by default)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)

    docs_df = io.load_docs(args.docs)
    facets_df = io.load_facets(args.facets)
    l2_to_l1 = io.load_l2_l1(args.l2_l1)

    print("⏳ Building L2 signatures…", flush=True)
    signatures = build_l2_signatures(docs_df, facets_df, l2_to_l1)
    print(f"✓ {len(signatures)} signatures", flush=True)

    client = ClaudeClient()
    descriptions_df = describe_all(
        docs_df,
        facets_df,
        signatures,
        client,
        top_n_docs=args.top_docs,
        top_n_facets=args.top_facets,
        sleep_seconds=args.sleep,
        contrastive=args.contrastive,
    )

    args.out.mkdir(parents=True, exist_ok=True)
    out_path = args.out / "l2_descriptions.xlsx"
    descriptions_df.to_excel(out_path, index=False)
    print(f"\n✓ {len(descriptions_df)} descriptions")
    print(f"✓ {out_path}")


if __name__ == "__main__":
    main()
