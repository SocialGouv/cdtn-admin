"""Taux de personnalisation des simulateurs via le réplica SQL de Matomo.

Pour chaque visite, on reconstruit la séquence ordonnée des events émis par les
simulateurs, on la découpe par simulateur et on classe chaque simulation allée
jusqu'au résultat :

* ``cc_select_traitée`` avant le résultat → réponse **personnalisée** (basée sur
  la convention collective) ;
* sinon ``cc_select_non_traitée`` → réponse **non personnalisée** (CC choisie mais
  non traitée, le calcul retombe sur le Code du travail) ;
* sinon ``click_p3`` (l'usager ne souhaite pas renseigner sa CC) → réponse
  **Code du travail** (``cdt``).

Une visite n'incrémente qu'une seule colonne par simulateur, selon la priorité
personnalisée > non personnalisée > cdt. Si aucune simulation du simulateur
n'aboutit à une réponse classée (résultat non atteint, ou atteint sans signal CC),
la visite est comptée dans ``nb_non_complete``, hors de ``nb_visites_total_complete``.
Un résultat « inéligible » (``results_ineligible``) compte comme un résultat.

Les taux ne sont pas stockés : taux de personnalisation =
``nb_personnalisee / nb_visites_total_complete`` ; taux de non complétion =
``nb_non_complete / (nb_visites_total_complete + nb_non_complete)``.
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.matomo_segments import DEVICE_SEGMENTS, device_from_os

# Simulateurs analysés (titre tel qu'émis dans ``view_step_<titre>``).
SIMULATEURS: list[str] = [
    "Indemnité de rupture conventionnelle",
    "Indemnité de licenciement",
    "Préavis de démission",
    "Indemnité de précarité",
    "Préavis de licenciement",
    "Préavis de départ ou de mise à la retraite",
]

DEVICES: list[str] = list(DEVICE_SEGMENTS)

# Les events ``click_p3`` (``name``) et ``cc_select_p1/p2`` (``action``) portent
# le simulateur sous deux formes selon le front : le titre pour les indemnités de
# départ, le code ``PublicodesSimulator`` pour les autres. On normalise vers le
# titre.
_TITRE_BY_CODE: dict[str, str] = {
    "RUPTURE_CONVENTIONNELLE": "Indemnité de rupture conventionnelle",
    "INDEMNITE_LICENCIEMENT": "Indemnité de licenciement",
    "PREAVIS_DEMISSION": "Préavis de démission",
    "INDEMNITE_PRECARITE": "Indemnité de précarité",
    "PREAVIS_LICENCIEMENT": "Préavis de licenciement",
    "PREAVIS_RETRAITE": "Préavis de départ ou de mise à la retraite",
}

_VIEW_STEP_PREFIX = "view_step_"
# Étapes d'entrée d'une simulation (``start``, ou ``intro`` pour la retraite).
_START_STEPS = {"start", "intro"}
# Étape résultat : ``result`` / ``results`` / ``results_eligible`` … ou
# ``indemnite`` (indemnité de précarité).
_RESULT_PREFIX = "result"
_RESULT_STEPS = {"indemnite"}

_ACTION_TREATED = "cc_select_traitée"
_ACTION_UNTREATED = "cc_select_non_traitée"
_ACTION_NOT_SELECTED = "click_p3"
# Ces events portent le titre du simulateur (``action`` ou ``name``).
_CATEGORIES_SELECT = {"cc_select_p1", "cc_select_p2"}

_COLUMNS = [
    "device",
    "titre",
    "nb_personnalisee",
    "nb_non_personnalisee",
    "nb_cdt",
    "nb_visites_total_complete",
    "nb_non_complete",
]

_EVENT_COLUMNS = [
    "idvisit",
    "action_id",
    "action_timestamp",
    "operatingsystemname",
    "action_eventcategory",
    "action_eventaction",
    "action_eventname",
]

_QUERY = f"""
SELECT {", ".join(_EVENT_COLUMNS)}
FROM matomo_partitioned
WHERE action_type = 'event'
  AND action_timestamp >= %s
  AND action_timestamp < %s::date + 1
  AND (
        action_eventaction LIKE 'view\\_step\\_%%'
     OR action_eventaction IN (%s, %s, %s)
     OR action_eventcategory IN ('cc_select_p1', 'cc_select_p2')
  )
ORDER BY idvisit, action_timestamp, action_id;
"""

# Priorité en cas de plusieurs simulations du même simulateur dans une visite.
_PRIORITY = ["personnalisee", "non_personnalisee", "cdt"]
# Simulateur utilisé dans la visite sans qu'aucune simulation n'aboutisse à une
# réponse classée (résultat non atteint, ou atteint sans signal CC).
_NON_COMPLETE = "non_complete"


def get_taux_personnalisation_simulateurs(
    date: str, matomo: object | None = None
) -> pd.DataFrame:
    """Retourne les réponses par type de personnalisation pour une date donnée.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Non utilisé (les données viennent du réplica SQL Matomo, ouvert
            par le report). Conservé pour uniformité avec les autres reports.

    Returns:
        DataFrame avec les colonnes : device, titre, nb_personnalisee,
        nb_non_personnalisee, nb_cdt, nb_visites_total_complete. Une ligne par
        (device, simulateur), à 0 si aucun résultat ce jour-là. Le taux se
        déduit de nb_personnalisee / nb_visites_total_complete.
    """
    with MatomoSQLConnectorSync() as client:
        events = client.run_query_df(
            _QUERY,
            (date, date, _ACTION_TREATED, _ACTION_UNTREATED, _ACTION_NOT_SELECTED),
        )
    return classify_events(events)


def classify_events(events: pd.DataFrame) -> pd.DataFrame:
    """Classe les simulations d'un jeu d'events et agrège par (device, simulateur).

    Fonction pure (sans I/O), séparée de la requête pour être testable.

    Args:
        events: events triés par visite puis par date, avec au moins les
            colonnes ``idvisit``, ``operatingsystemname``,
            ``action_eventcategory``, ``action_eventaction``,
            ``action_eventname``.
    """
    counts = {
        (device, titre): dict.fromkeys([*_PRIORITY, _NON_COMPLETE], 0)
        for device in DEVICES
        for titre in SIMULATEURS
    }

    if not events.empty:
        for _, visit in events.groupby("idvisit", sort=False):
            device = (
                "mobile"
                if any(
                    device_from_os(os) == "mobile"
                    for os in visit["operatingsystemname"]
                )
                else "desktop"
            )
            for titre, outcome in _classify_visit(visit).items():
                counts[(device, titre)][outcome] += 1

    rows = [
        {
            "device": device,
            "titre": titre,
            "nb_personnalisee": c["personnalisee"],
            "nb_non_personnalisee": c["non_personnalisee"],
            "nb_cdt": c["cdt"],
            "nb_visites_total_complete": sum(c[k] for k in _PRIORITY),
            "nb_non_complete": c[_NON_COMPLETE],
        }
        for (device, titre), c in counts.items()
    ]
    return pd.DataFrame(rows, columns=_COLUMNS)


# ---------------------------------------------------------------------------
# Fonctions internes
# ---------------------------------------------------------------------------


def _is_result(step_name: str) -> bool:
    return step_name.startswith(_RESULT_PREFIX) or step_name in _RESULT_STEPS


def _classify_visit(visit: pd.DataFrame) -> dict[str, str]:
    """Retourne, pour chaque simulateur mené au résultat, l'issue retenue.

    Parcourt les events dans l'ordre. Le simulateur « courant » est celui du
    dernier event qui porte un titre : les events ``cc_select_traitée`` /
    ``cc_select_non_traitée`` n'en ont pas et lui sont rattachés. Les signaux CC
    sont remis à zéro à chaque début de simulation. À chaque résultat, la
    simulation est classée (traitée > non traitée > click_p3) ; si plusieurs
    simulations du même simulateur aboutissent, la meilleure issue est retenue.
    """
    outcomes: dict[str, str] = {}
    touched: set[str] = set()
    current: str | None = None
    signals: dict[str, set[str]] = {}

    for category, action, name in zip(
        visit["action_eventcategory"],
        visit["action_eventaction"],
        visit["action_eventname"],
        strict=True,
    ):
        action = action or ""
        name = name or ""

        if action.startswith(_VIEW_STEP_PREFIX):
            titre = action[len(_VIEW_STEP_PREFIX) :]
            if titre not in SIMULATEURS:
                continue
            current = titre
            touched.add(titre)
            if name in _START_STEPS:
                signals[titre] = set()
            elif _is_result(name):
                outcome = _outcome(signals.get(titre, set()))
                if outcome and _better(outcome, outcomes.get(titre)):
                    outcomes[titre] = outcome
        elif category in _CATEGORIES_SELECT and _to_titre(action):
            current = _to_titre(action)
        elif action == _ACTION_NOT_SELECTED and _to_titre(name):
            current = _to_titre(name)
            signals.setdefault(current, set()).add(_ACTION_NOT_SELECTED)
        elif action in (_ACTION_TREATED, _ACTION_UNTREATED) and current:
            signals.setdefault(current, set()).add(action)

    for titre in touched - outcomes.keys():
        outcomes[titre] = _NON_COMPLETE
    return outcomes


def _to_titre(value: str) -> str | None:
    """Titre du simulateur d'après un titre ou un code ``PublicodesSimulator``."""
    if value in SIMULATEURS:
        return value
    return _TITRE_BY_CODE.get(value)


def _outcome(signals: set[str]) -> str | None:
    """Issue d'une simulation d'après les signaux CC vus avant son résultat."""
    if _ACTION_TREATED in signals:
        return "personnalisee"
    if _ACTION_UNTREATED in signals:
        return "non_personnalisee"
    if _ACTION_NOT_SELECTED in signals:
        return "cdt"
    return None


def _better(candidate: str, current: str | None) -> bool:
    return current is None or _PRIORITY.index(candidate) < _PRIORITY.index(current)
