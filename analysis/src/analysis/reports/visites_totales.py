"""Visites et pages vues totales de la journée par device (réplica SQL Matomo).

Pour chaque device (desktop / mobile), compte sur tout le site :

* ``nb_visites`` — **visites** ayant vu au moins une page (``action_type =
  'action'``), cohérent avec ``visites_par_type_contenu`` (aucun type n'y dépasse
  ce total) ;
* ``nb_pages_vues`` — **pages vues** (hors events et téléchargements).
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.matomo_segments import device_from_os

_COLUMNS = ["device", "nb_visites", "nb_pages_vues"]

# L'OS est constant dans une visite : les visites distinctes par OS sont disjointes
# et se somment exactement par device.
_QUERY = """
SELECT
    operatingsystemname,
    COUNT(DISTINCT idvisit) AS nb_visites,
    COUNT(*) AS nb_pages_vues
FROM matomo_partitioned
WHERE action_timestamp >= %s
  AND action_timestamp < %s::date + 1
  AND action_type = 'action'
GROUP BY operatingsystemname;
"""


def get_visites_totales(date: str, matomo: object | None = None) -> pd.DataFrame:
    """Retourne les visites et pages vues totales par device pour une date donnée.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Non utilisé (les données viennent du réplica SQL Matomo, ouvert
            par le report). Conservé pour uniformité avec les autres reports.

    Returns:
        DataFrame avec les colonnes : device, nb_visites, nb_pages_vues. Une ligne
        par device ayant au moins une page vue ce jour-là.
    """
    with MatomoSQLConnectorSync() as client:
        counts = client.run_query_df(_QUERY, (date, date))
    return classify_counts(counts)


def classify_counts(counts: pd.DataFrame) -> pd.DataFrame:
    """Rattache les décomptes par OS à un device et les somme.

    Fonction pure (sans I/O), séparée de la requête pour être testable.

    Args:
        counts: décomptes avec les colonnes ``operatingsystemname``,
            ``nb_visites`` et ``nb_pages_vues``.
    """
    if counts.empty:
        return pd.DataFrame(columns=_COLUMNS)

    typed = pd.DataFrame(
        {
            "device": counts["operatingsystemname"].map(device_from_os),
            "nb_visites": counts["nb_visites"].astype(int),
            "nb_pages_vues": counts["nb_pages_vues"].astype(int),
        }
    )
    return typed.groupby("device", as_index=False).sum()
