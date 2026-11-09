# Contexte pour construire un notebook d'analyse Matomo

À lire **avant d'écrire** un notebook one shot. Tu génères le notebook complet
(contrairement à un usage « brique par brique ») : le PO ne code pas. En
contrepartie, **tu ne devines pas** ce qui est ambigu : tu poses la question
avant d'écrire la requête (voir « Quand poser des questions »).

## Les events du front

Le détail des events envoyés par le front est dans le plan de tracking :
https://github.com/SocialGouv/code-du-travail-numerique/wiki/Plan-de-tracking-Matomo
(charge-le avec `WebFetch`). **Il peut ne pas être exhaustif ni à jour** : il y a
des spécificités non indiquées. Confirme donc avec le PO chaque event utilisé
(catégorie / action / nom attendus) avant de bâtir l'analyse dessus, et
regarde les notebooks existants (`analysis/notebooks/`) et les reports
(`analysis/src/analysis/reports/`) qui exploitent déjà des events proches.

## Les données : la table `matomo_partitioned`

Réplica PostgreSQL (lecture seule) qui contient **toutes les lignes d'actions de
toutes les visites**. Schéma :

```sql
CREATE TABLE IF NOT EXISTS public.matomo_partitioned (
	action_id text NOT NULL,
	idsite text,
	idvisit text,
	actions text,
	country text,
	region text,
	city text,
	operatingsystemname text,
	devicemodel text,
	devicebrand text,
	visitduration text,
	dayssincefirstvisit text,
	visitortype text,
	sitename text,
	userid text,
	serverdateprettyfirstaction date,
	action_type text,
	action_eventcategory text,
	action_eventaction text,
	action_eventname text,
	action_eventvalue numeric,
	action_timespent text,
	action_timestamp timestamp with time zone DEFAULT now() NOT NULL,
	usercustomproperties json,
	usercustomdimensions json,
	dimension1 text, dimension2 text, dimension3 text, dimension4 text, dimension5 text,
	dimension6 text, dimension7 text, dimension8 text, dimension9 text, dimension10 text,
	action_url text,
	sitesearchkeyword text,
	action_title text,
	visitorid text,
	referrertype text,
	referrername text,
	resolution text,
	experiments jsonb
) PARTITION BY RANGE (action_timestamp);
```

À retenir :

- `action_type` vaut `'action'` (page vue), `'event'` (event) ou `'download'`
  (téléchargement).
- `idvisit` regroupe les lignes d'une même visite ; `actions` donne l'**ordre**
  des actions dans la visite (c'est du texte : convertir en entier avant de
  trier, ou trier sur `action_timestamp`).
- Le device se déduit de `operatingsystemname` (mobile = iOS/Android) via
  `analysis.matomo_segments.device_from_os`.
- `experiments` (jsonb) contient les variantes d'A/B testing :

  ```json
  [{"name": "LabelCardSearch", "variation": {"name": "fiche-pratique", "idvariation": 7}, "idexperiment": "5"},
   {"name": "contribution_afficher_info", "variation": {"name": "Version originale", "idvariation": 0}, "idexperiment": "8"}]
  ```

  Ici deux tests A/B (`LabelCardSearch`, `contribution_afficher_info`), avec la
  variante de chacun.

## Charger les données (patron à suivre)

Requêtes **simples** : pas de `JOIN`, `GROUP BY`, sous-requête ; un `WHERE` (période,
type, URL…) est bienvenu. Tout le travail sur la donnée se fait ensuite en
**pandas**. Raison : la réplique est partagée, et une requête lourde la ralentit
pour tout le monde. Sur plusieurs jours, boucle jour par jour.

```python
import pandas as pd
from analysis.connectors.matomo import MatomoSQLConnectorSync

COLUMNS = [
    "action_id", "idvisit", "actions", "operatingsystemname", "action_type",
    "action_eventcategory", "action_eventaction", "action_eventname",
    "action_eventvalue", "action_url", "experiments",
]  # ne garder que les colonnes utiles

QUERY = f"""
SELECT {", ".join(COLUMNS)} FROM matomo_partitioned
WHERE action_timestamp >= %s AND action_timestamp < %s
ORDER BY action_timestamp ASC
"""

with MatomoSQLConnectorSync() as matomo:
    visits_df = matomo.run_query_df(QUERY, ("2026-06-01 00:00:00", "2026-06-02 00:00:00"))
```

On utilise le connecteur **synchrone** (`MatomoSQLConnectorSync`, valeurs passées
en paramètres `%s`). Le connecteur asynchrone (`MatomoSQLConnector`, `await`)
existe dans d'anciens notebooks : ne pas le reprendre pour un nouveau.

## Google Search Console (si le besoin l'exige)

```python
from analysis.connectors.gsc import GSCConnector

gsc = GSCConnector()
df = gsc.query_df("2026-06-01", "2026-09-20", dimensions=["query", "page"])
```

Vérifie d'abord que `analysis/src/analysis/connectors/gsc.py` existe dans la
branche courante (ce n'était pas le cas au moment de l'écriture de ce skill). S'il
manque, dis-le au PO au lieu d'inventer l'import.

## Quand poser des questions (avant d'écrire)

Pose les questions **regroupées**, en langage métier, dès que tu as un doute sur :

- **L'ordonnancement des events** : « l'event X doit-il arriver *avant* ou *après*
  la page Y dans la visite ? immédiatement après, ou n'importe quand ensuite ? »
  Une visite peut contenir plusieurs fois le même event : on compte la visite une
  fois ou chaque occurrence ?
- **Les noms exacts des events** (catégorie, action, nom) quand le plan de tracking
  ne les donne pas ou semble ambigu.
- **L'unité de comptage** : visites (`idvisit`), visiteurs (`visitorid`), pages vues,
  occurrences d'event.
- **Le périmètre** : période, device, pages concernées (formes d'URL, avec ou sans
  convention collective), un seul contenu par visite ou tous.
- **Les cas limites** : rechargement de page, retour sur la même page, visites sans
  page vue, event sans page associée.

Reformule ta compréhension (« je vais compter les visites qui voient la page A puis,
après, déclenchent l'event B ») et fais valider avant de générer.
