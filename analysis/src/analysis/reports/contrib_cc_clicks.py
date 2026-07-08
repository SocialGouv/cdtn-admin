"""Visites par contribution et clics « afficher les informations (CC) ».

Pour chaque contribution générique du site (liste de slugs **fournie
explicitement** — constante ``BASE_SLUGS``, surchargeable via l'argument
``base_slugs``) et pour chaque device (desktop / mobile), calcule :

* ``nb_visites_uniques`` — nombre de visites Matomo (``VisitsSummary.get``) sur
  toutes les pages de la contribution (page générique + toutes ses pages
  personnalisées par convention collective), via un segment Matomo combinant une
  correspondance exacte et trois préfixes (``/{slug}``, ``/{slug}/…``,
  ``/{slug}?…``, ``/{slug}#…``) ;
* ``nb_visits_click_sans_CC`` / ``nb_visits_click_avec_CC`` — nombre de visites
  ayant déclenché l'event ``click_afficher_les_informations_sans_CC`` /
  ``click_afficher_les_informations_CC`` (``Events.getAction``), le slug de la
  contribution étant extrait du nom d'event (``Events_EventName``).

Une ligne ``slug="TOTAL"`` par device résume la somme sur toutes les
contributions (utile en notebook ; **non persistée**, voir
``analysis.commands.ingest_contrib_cc_clicks``).

``nb_visits_click_total`` (= sans_CC + avec_CC) est calculé ici pour fidélité
avec le calcul d'origine mais n'est pas non plus persisté : c'est une valeur
dérivable, Metabase la recalcule (voir la commande d'ingestion).
"""

from __future__ import annotations

import re
import time

import pandas as pd

from analysis.connectors.matomo_reporting import MatomoReportingConnector
from analysis.matomo_segments import DEVICE_SEGMENTS

_CONTRIB_BASE_URL = "https://code.travail.gouv.fr/contribution/"

# Contributions à suivre. Liste explicite (et non dérivée du sitemap) : le
# périmètre suivi est un choix métier, pas « toutes les contributions du site ».
# Pour changer le périmètre, éditer cette liste ou passer ``base_slugs=`` à
# ``get_contrib_cc_clicks``.
BASE_SLUGS: list[str] = [
    "quel-est-le-salaire-minimum",
    "quel-est-le-salaire-minimum-dun-alternant-en-2026",
    "le-preavis-de-licenciement-doit-il-etre-execute-en-totalite-y-compris-si-le-salarie-a-retrouve-un-emploi",
    "quelle-est-la-duree-du-conge-de-maternite",
    "dans-le-cadre-dun-cdd-quel-est-le-montant-de-lindemnite-de-fin-de-contrat",
    "quelle-est-la-duree-maximale-du-contrat-de-mission-interim",
    "quelle-est-la-duree-de-preavis-en-cas-de-depart-a-la-retraite",
    "si-le-salarie-est-malade-pendant-ses-conges-quelles-en-sont-les-consequences",
    "si-un-poste-se-libere-ou-est-cree-dans-lentreprise-lemployeur-doit-il-en-informer-les-salaries-ou-le-leur-proposer-en-priorite",
    "heures-supplementaires",
    "quelles-sont-les-conditions-de-cumul-demplois",
    "conges-supplementaires-pour-anciennete",
    "faut-il-respecter-un-delai-de-carence-entre-deux-cdd-si-oui-quelle-est-sa-duree",
    "faut-il-respecter-un-delai-de-carence-entre-deux-contrats-de-mission-interim",
    "le-salarie-peut-il-sabsenter-pour-rechercher-un-emploi-pendant-son-preavis",
    "les-conges-pour-evenements-familiaux",
    "lentreprise-peut-elle-embaucher-dans-le-cadre-dun-cdi-de-chantier-ou-doperation",
    "quelle-peut-etre-la-duree-maximale-dun-cdd",
    "comment-determiner-lanciennete-du-salarie",
    "a-quelles-indemnites-peut-pretendre-un-salarie-qui-part-a-la-retraite",
    "embauche-en-contrat-dextra-cdd-dusage",
    "quelles-informations-doivent-figurer-dans-le-contrat-de-travail-ou-la-lettre-dengagement",
    "quelles-sont-les-conditions-dattribution-de-la-prime-pour-travaux-dangereux-et-de-la-prime-pour-travaux-insalubres",
    "en-cas-de-perte-de-marche-par-lemployeur-quelles-sont-les-conditions-dun-transfert-des-contrats-de-travail",
    "arret-maladie-pendant-la-periode-dessai-quelles-sont-les-regles",
    "quest-ce-quune-rupture-conventionnelle",
    "combien-de-fois-le-contrat-de-travail-peut-il-etre-renouvele",
    "arret-maladie-pendant-le-preavis-quelles-consequences",
    "quelles-sont-les-primes-prevues-par-la-convention-collective",
    "quand-le-salarie-a-t-il-droit-a-une-prime-danciennete-quel-est-son-montant",
    "dans-le-cadre-dun-contrat-de-mission-interim-quel-est-le-montant-de-lindemnite-de-fin-de-contrat",
    "quelles-sont-les-consequences-du-non-respect-du-preavis-par-le-salarie-ou-lemployeur",
    "quelle-est-la-duree-maximale-de-la-periode-dessai-sans-et-avec-renouvellement",
    "la-periode-dessai-peut-elle-etre-renouvelee",
    "quelles-sont-les-conditions-de-la-clause-de-non-concurrence",
    "quelle-est-la-duree-de-preavis-en-cas-de-mise-a-la-retraite",
    "travail-du-dimanche-quelle-contrepartie",
    "quelle-est-la-duree-du-preavis-en-cas-de-demission",
    "en-cas-de-maladie-le-salarie-a-t-il-droit-a-une-garantie-demploi",
    "quelles-sont-les-consequences-du-deces-de-lemployeur-sur-le-contrat-de-travail",
    "jours-feries-et-ponts-dans-le-secteur-prive",
    "quelle-est-la-duree-de-preavis-en-cas-de-licenciement",
    "est-il-obligatoire-davoir-un-contrat-de-travail-ecrit-et-signe",
    "le-preavis-de-demission-doit-il-etre-execute-en-totalite-y-compris-si-le-salarie-a-retrouve-un-emploi",
    "en-cas-darret-maladie-du-salarie-lemployeur-doit-il-assurer-le-maintien-de-salaire",
    "quelles-sont-les-conditions-dindemnisation-pendant-le-conge-de-maternite",
]

_EVENT_SANS_CC = "click_afficher_les_informations_sans_CC"
_EVENT_AVEC_CC = "click_afficher_les_informations_CC"

# Pause entre deux appels VisitsSummary.get (un par slug) pour ne pas bombarder
# l'API Matomo ; reprise telle quelle du calcul d'origine.
_REQUEST_SLEEP_SECONDS = 0.2

_SLUG_FROM_EVENT_NAME_RE = re.compile(r"contribution/([^/?#]+)")


def get_contrib_cc_clicks(
    date: str,
    matomo: MatomoReportingConnector | None = None,
    base_slugs: list[str] | None = None,
) -> pd.DataFrame:
    """Retourne le tableau visites/clics CC par device et par contribution.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Connecteur Reporting Matomo à réutiliser. Si ``None``, un
            connecteur (et son client HTTP) est ouvert le temps de l'appel.
        base_slugs: Slugs de contribution à suivre. Si ``None``, utilise la
            constante ``BASE_SLUGS`` (aucune récupération automatique depuis le
            sitemap).

    Returns:
        DataFrame avec les colonnes : device, slug, nb_visites_uniques,
        nb_visits_click_sans_CC, nb_visits_click_avec_CC, nb_visits_click_total.
        Une ligne par (device, slug) plus une ligne ``slug="TOTAL"`` par device.
    """
    if matomo is None:
        with MatomoReportingConnector() as client:
            return get_contrib_cc_clicks(date, client, base_slugs)

    slugs = base_slugs if base_slugs is not None else BASE_SLUGS

    parts = []
    for device, device_segment in DEVICE_SEGMENTS.items():
        part = _build_result_for_device(matomo, date, device_segment, slugs)
        part.insert(0, "device", device)
        parts.append(part)
    return pd.concat(parts, ignore_index=True)


# ---------------------------------------------------------------------------
# Fonctions internes
# ---------------------------------------------------------------------------


def _visits_segment(slug: str, device_segment: str | None) -> str:
    """Construit le segment Matomo (OR de 4 clauses ``pageUrl``, AND device)."""
    clauses = [
        f"pageUrl=={_CONTRIB_BASE_URL}{slug}",
        f"pageUrl=^{_CONTRIB_BASE_URL}{slug}/",
        f"pageUrl=^{_CONTRIB_BASE_URL}{slug}?",
        f"pageUrl=^{_CONTRIB_BASE_URL}{slug}#",
    ]
    if device_segment:
        clauses = [f"{c};{device_segment}" for c in clauses]
    return ",".join(clauses)


def _fetch_visits_for_slug(
    matomo: MatomoReportingConnector,
    date: str,
    slug: str,
    device_segment: str | None,
) -> int:
    segment = _visits_segment(slug, device_segment)
    return matomo.get_visits_summary(date, segment=segment)


def _fetch_event_visits_by_slug(
    matomo: MatomoReportingConnector,
    date: str,
    event_action: str,
    device_segment: str | None,
) -> pd.Series:
    """Visites de ``event_action``, regroupées par slug de contribution.

    Le slug est extrait du nom d'event (``Events_EventName``, de la forme
    ``…/contribution/{slug}…``) ; un event sans slug reconnaissable est ignoré.
    """
    data = matomo.get_events_action(
        date,
        filter_pattern=event_action,
        segment=device_segment,
    )
    df = pd.json_normalize(data)
    if df.empty or "Events_EventAction" not in df.columns:
        return pd.Series(dtype="int64")
    df = df[df["Events_EventAction"] == event_action].copy()
    df["slug"] = df["Events_EventName"].str.extract(_SLUG_FROM_EVENT_NAME_RE)[0]
    return df.dropna(subset=["slug"]).groupby("slug")["nb_visits"].sum()


def _build_result_for_device(
    matomo: MatomoReportingConnector,
    date: str,
    device_segment: str,
    slugs: list[str],
) -> pd.DataFrame:
    rows = []
    for slug in slugs:
        rows.append(
            {
                "slug": slug,
                "nb_visites_uniques": _fetch_visits_for_slug(
                    matomo, date, slug, device_segment
                ),
            }
        )
        time.sleep(_REQUEST_SLEEP_SECONDS)
    seg = (
        pd.DataFrame(rows)
        .sort_values("nb_visites_uniques", ascending=False)
        .reset_index(drop=True)
    )

    sans_cc = _fetch_event_visits_by_slug(matomo, date, _EVENT_SANS_CC, device_segment)
    avec_cc = _fetch_event_visits_by_slug(matomo, date, _EVENT_AVEC_CC, device_segment)
    seg["nb_visits_click_sans_CC"] = seg["slug"].map(sans_cc).fillna(0).astype(int)
    seg["nb_visits_click_avec_CC"] = seg["slug"].map(avec_cc).fillna(0).astype(int)
    seg["nb_visits_click_total"] = (
        seg["nb_visits_click_sans_CC"] + seg["nb_visits_click_avec_CC"]
    )

    total = pd.DataFrame(
        {
            "slug": ["TOTAL"],
            "nb_visites_uniques": [seg["nb_visites_uniques"].sum()],
            "nb_visits_click_sans_CC": [seg["nb_visits_click_sans_CC"].sum()],
            "nb_visits_click_avec_CC": [seg["nb_visits_click_avec_CC"].sum()],
            "nb_visits_click_total": [seg["nb_visits_click_total"].sum()],
        }
    )
    return pd.concat([seg, total], ignore_index=True)
