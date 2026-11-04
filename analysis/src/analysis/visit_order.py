"""Ordre des actions d'une visite dans le réplica SQL Matomo.

La colonne ``actions`` de ``matomo_partitioned`` n'est **pas** un rang : c'est le
nombre total d'actions de la visite, identique sur toutes ses lignes. L'ordre
réel est ``action_timestamp`` puis l'indice porté par ``action_id``
(``{idvisit}_{n}``), à comparer en numérique (``_10`` vient après ``_2``).
"""

from __future__ import annotations

import pandas as pd


def with_position(events: pd.DataFrame) -> pd.DataFrame:
    """Trie les events par visite et ordre chronologique, et ajoute ``position``.

    ``position`` est le rang de l'event dans sa visite (0 = premier).

    Args:
        events: au moins les colonnes ``idvisit``, ``action_timestamp`` et
            ``action_id``.
    """
    index = events["action_id"].astype(str).str.rsplit("_", n=1).str[-1]
    ordered = (
        events.assign(_index=pd.to_numeric(index, errors="coerce"))
        .sort_values(["idvisit", "action_timestamp", "_index"], kind="stable")
        .drop(columns="_index")
    )
    return ordered.assign(position=ordered.groupby("idvisit").cumcount())
