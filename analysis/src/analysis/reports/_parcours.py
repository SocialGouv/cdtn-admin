"""Logique commune des reports « parcours » (contributions, fiches SP).

Même modèle que ``parcours_actualites`` : pour chaque (device, type de référent,
slug), compte des **visites** (jamais des pages vues) :

* ``nb_visites_total`` — visites ayant vu le contenu, quelle que soit leur page
  d'entrée ;
* ``entry_column`` — parmi elles, celles qui **démarrent** sur ce contenu (la
  première page vue du jour en est une page) ;
* ``nb_visites_suite`` — parmi ces dernières, celles qui consultent ensuite une
  **autre page** : une page vue postérieure qui n'est pas le contenu d'entrée
  lui-même (un rechargement ne compte pas ; revenir sur le contenu d'entrée après
  une autre page compte).

« Même contenu » se juge au slug que renvoie ``slug_of`` : pour une contribution,
les versions générique et personnalisées par convention collective partagent le
même slug, donc passer de l'une à l'autre n'est pas une poursuite.
"""

from __future__ import annotations

from collections.abc import Callable

import pandas as pd

from analysis.matomo_segments import device_from_os

# Référent des visites sans ``referrertype`` renseigné.
REFERRER_UNKNOWN = "inconnu"

EVENT_COLUMNS = [
    "idvisit",
    "actions",
    "action_id",
    "operatingsystemname",
    "referrertype",
    "action_url",
]


def query_pages() -> str:
    """Requête des pages vues des visites ayant vu une page ``LIKE`` donnée.

    Paramètres attendus : ``(date, date, date, date, like)``. La visite est
    reconstruite via ``idvisit``.
    """
    return f"""
SELECT {", ".join(EVENT_COLUMNS)}
FROM matomo_partitioned
WHERE action_timestamp >= %s
  AND action_timestamp < %s::date + 1
  AND action_type = 'action'
  AND idvisit IN (
        SELECT idvisit
        FROM matomo_partitioned
        WHERE action_timestamp >= %s
          AND action_timestamp < %s::date + 1
          AND action_type = 'action'
          AND action_url LIKE %s
  )
ORDER BY idvisit, actions, action_id;
"""


def referrer(referrer_type: pd.Series) -> pd.Series:
    """Type de référent normalisé (minuscules), ``inconnu`` si absent."""
    return (
        referrer_type.fillna(REFERRER_UNKNOWN).str.lower().replace("", REFERRER_UNKNOWN)
    )


def classify(
    pages: pd.DataFrame,
    slug_of: Callable[[str], str | None],
    entry_column: str,
) -> pd.DataFrame:
    """Classe les visites et agrège par (device, référent, slug).

    Fonction pure (sans I/O), séparée de la requête pour être testable.

    Args:
        pages: pages vues, avec au moins les colonnes ``idvisit``, ``actions``,
            ``action_id``, ``operatingsystemname``, ``referrertype`` et
            ``action_url``.
        slug_of: slug du contenu d'une URL, ``None`` si ce n'est pas une page de
            ce contenu.
        entry_column: nom de la colonne des visites entrantes.
    """
    columns = [
        "device",
        "referrer_type",
        "slug",
        "nb_visites_total",
        entry_column,
        "nb_visites_suite",
    ]
    if pages.empty:
        return pd.DataFrame(columns=columns)

    pages = pages.sort_values(["idvisit", "actions", "action_id"])
    pages = pages.assign(slug=pages["action_url"].fillna("").map(slug_of))

    # Visites ayant vu chaque contenu (une visite compte une fois par slug).
    seen = pages.dropna(subset=["slug"]).drop_duplicates(["idvisit", "slug"])
    if seen.empty:
        return pd.DataFrame(columns=columns)

    # Une visite démarre sur un contenu si sa première page vue en est un.
    first = pages.drop_duplicates("idvisit", keep="first").set_index("idvisit")
    entries = first.dropna(subset=["slug"])

    # Poursuite : une page vue après l'entrée qui n'est pas le contenu d'entrée.
    first_action = pages["idvisit"].map(entries["actions"])
    first_slug = pages["idvisit"].map(entries["slug"])
    later = pages[(pages["actions"] > first_action) & (pages["slug"] != first_slug)]

    is_entry = seen["idvisit"].map(entries["slug"]) == seen["slug"]
    visits = pd.DataFrame(
        {
            "device": seen["operatingsystemname"].map(device_from_os),
            "referrer_type": referrer(seen["referrertype"]),
            "slug": seen["slug"],
            "nb_visites_total": 1,
            entry_column: is_entry.astype(int),
            "nb_visites_suite": (
                is_entry & seen["idvisit"].isin(later["idvisit"])
            ).astype(int),
        }
    )
    out = visits.groupby(["device", "referrer_type", "slug"], as_index=False).sum()
    return out.loc[:, columns]
