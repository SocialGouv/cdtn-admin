"""Taux de complétion et de personnalisation des contributions (réplica SQL Matomo).

Pour chaque contribution générique suivie (constante ``BASE_SLUGS``, surchargeable
via l'argument ``base_slugs``) et pour chaque device (desktop / mobile), compte
des **visites** (jamais des events) :

* ``nb_visites_total`` — visites ayant vu la page **générique** de la contribution
  (``/contribution/{slug}``) à un moment de la visite, quelle que soit la page
  d'entrée. Une visite qui ne voit que des pages personnalisées par convention
  collective, sans jamais passer par la générique, est exclue.
* Parmi ces visites, celles qui ont cliqué sur « Afficher les informations »,
  rangées dans **un seul** des trois cas, par priorité décroissante :

  1. ``nb_visites_cc`` — je consulte le résultat de ma CC
     (``click_afficher_les_informations_CC``) ;
  2. ``nb_visites_cdt_cc_non_traitee`` — je consulte le CDT faute de réponse pour
     ma CC (``click_afficher_les_informations_générales``) ;
  3. ``nb_visites_cdt`` — je consulte le CDT, sans CC
     (``click_afficher_les_informations_sans_CC``).

Les taux ne sont pas stockés (valeurs dérivables, calculées dans Metabase) :
complétion = ``(nb_visites_cc + nb_visites_cdt_cc_non_traitee + nb_visites_cdt) /
nb_visites_total`` ; personnalisation = ``nb_visites_cc / nb_visites_total``.
"""

from __future__ import annotations

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.matomo_segments import DEVICE_SEGMENTS, device_from_os

# Contributions à suivre. Liste explicite (et non dérivée du sitemap) : le
# périmètre suivi est un choix métier, pas « toutes les contributions du site ».
# Pour changer le périmètre, éditer cette liste ou passer ``base_slugs=`` à
# ``get_taux_contributions``.
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

DEVICES: list[str] = list(DEVICE_SEGMENTS)

# Events « Afficher les informations », du plus au moins prioritaire. La colonne
# de sortie associée est donnée par ``_CASE_COLUMNS``.
_EVENT_AVEC_CC = "click_afficher_les_informations_CC"
_EVENT_CC_NON_TRAITEE = "click_afficher_les_informations_générales"
_EVENT_SANS_CC = "click_afficher_les_informations_sans_CC"
_CASE_COLUMNS: dict[str, str] = {
    _EVENT_AVEC_CC: "nb_visites_cc",
    _EVENT_CC_NON_TRAITEE: "nb_visites_cdt_cc_non_traitee",
    _EVENT_SANS_CC: "nb_visites_cdt",
}
_PRIORITY: list[str] = list(_CASE_COLUMNS)

_COLUMNS = [
    "device",
    "slug",
    "nb_visites_total",
    "nb_visites_cc",
    "nb_visites_cdt_cc_non_traitee",
    "nb_visites_cdt",
]

# Page générique : ``/contribution/{slug}``, avec ou sans slash final, requête ou
# ancre (``#`` : affichage direct du contenu). Les pages CC (``/{slug}/{idcc}``)
# n'y correspondent pas.
_GENERIC_PAGE_RE = r"/contribution/([^/?#]+)/?(?:[?#].*)?$"
# Slug extrait du nom d'event (``…/contribution/{slug}…``). Le nom peut porter un
# suffixe d'expérimentation (``/contribution/{slug}|variant=original``) : ``|``
# termine donc le slug.
_SLUG_FROM_EVENT_NAME_RE = r"contribution/([^/?#|]+)"

_EVENT_COLUMNS = [
    "idvisit",
    "operatingsystemname",
    "action_type",
    "action_url",
    "action_eventaction",
    "action_eventname",
]

_QUERY = f"""
SELECT {", ".join(_EVENT_COLUMNS)}
FROM matomo_partitioned
WHERE action_timestamp >= %s
  AND action_timestamp < %s::date + 1
  AND (
        (action_type = 'action' AND action_url LIKE %s)
     OR (action_type = 'event' AND action_eventaction IN (%s, %s, %s))
  )
ORDER BY idvisit, action_timestamp, action_id;
"""


def get_taux_contributions(
    date: str,
    matomo: object | None = None,
    base_slugs: list[str] | None = None,
) -> pd.DataFrame:
    """Retourne les visites par cas de consultation pour une date donnée.

    Args:
        date: Date au format ISO YYYY-MM-DD (ex: "2026-06-01").
        matomo: Non utilisé (les données viennent du réplica SQL Matomo, ouvert
            par le report). Conservé pour uniformité avec les autres reports.
        base_slugs: Slugs de contribution à suivre. Si ``None``, utilise la
            constante ``BASE_SLUGS``.

    Returns:
        DataFrame avec les colonnes : device, slug, nb_visites_total,
        nb_visites_cc, nb_visites_cdt_cc_non_traitee, nb_visites_cdt. Une ligne
        par (device, slug), à 0 si aucune visite ce jour-là.
    """
    with MatomoSQLConnectorSync() as client:
        events = client.run_query_df(
            _QUERY,
            (
                date,
                date,
                "%/contribution/%",
                _EVENT_AVEC_CC,
                _EVENT_CC_NON_TRAITEE,
                _EVENT_SANS_CC,
            ),
        )
    return classify_events(events, base_slugs)


def classify_events(
    events: pd.DataFrame, base_slugs: list[str] | None = None
) -> pd.DataFrame:
    """Classe les visites d'un jeu d'events et agrège par (device, slug).

    Fonction pure (sans I/O), séparée de la requête pour être testable.

    Args:
        events: pages vues et events, avec au moins les colonnes ``idvisit``,
            ``operatingsystemname``, ``action_type``, ``action_url``,
            ``action_eventaction`` et ``action_eventname``.
        base_slugs: slugs suivis (défaut : ``BASE_SLUGS``).
    """
    slugs = base_slugs if base_slugs is not None else BASE_SLUGS
    counts = pd.DataFrame(
        [
            {"device": device, "slug": slug, **dict.fromkeys(_COLUMNS[2:], 0)}
            for device in DEVICES
            for slug in slugs
        ],
        columns=_COLUMNS,
    ).set_index(["device", "slug"])

    if events.empty:
        return counts.reset_index()

    # Une visite est « mobile » si au moins un de ses events l'est.
    is_mobile = (
        events["operatingsystemname"]
        .map(device_from_os)
        .eq("mobile")
        .groupby(events["idvisit"])
        .any()
    )
    devices = is_mobile.map({True: "mobile", False: "desktop"})

    pages = events[events["action_type"] == "action"]
    page_slug = pages["action_url"].str.extract(_GENERIC_PAGE_RE)[0]
    seen = (
        pd.DataFrame({"idvisit": pages["idvisit"], "slug": page_slug})
        .dropna(subset=["slug"])
        .query("slug in @slugs")
        .drop_duplicates()
    )

    clicks = events[
        (events["action_type"] == "event")
        & events["action_eventaction"].isin(_PRIORITY)
    ]
    click_slug = clicks["action_eventname"].str.extract(_SLUG_FROM_EVENT_NAME_RE)[0]
    clicks = pd.DataFrame(
        {
            "idvisit": clicks["idvisit"],
            "slug": click_slug,
            "rank": clicks["action_eventaction"].map(_PRIORITY.index),
        }
    ).dropna(subset=["slug"])
    # Un clic ne compte que si la visite a vu la page générique de la contribution.
    # Une visite n'est rangée que dans son cas le plus prioritaire.
    best = (
        clicks.merge(seen, on=["idvisit", "slug"])
        .groupby(["idvisit", "slug"], as_index=False)["rank"]
        .min()
    )

    seen["device"] = seen["idvisit"].map(devices)
    best["device"] = best["idvisit"].map(devices)

    totals = seen.groupby(["device", "slug"]).size()
    counts["nb_visites_total"] = totals.reindex(counts.index, fill_value=0)
    for rank, column in enumerate(_CASE_COLUMNS.values()):
        by_case = best[best["rank"] == rank].groupby(["device", "slug"]).size()
        counts[column] = by_case.reindex(counts.index, fill_value=0)

    return counts.reset_index()
