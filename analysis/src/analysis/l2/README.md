# Pipeline L2 — audit de taxonomie de contenu

Outil d'audit éditorial **occasionnel** : il construit, pour chaque L2
(sous-thème) du site, une « signature » sémantique (embeddings de documents +
facettes extraites par LLM) et s'en sert pour :

- repérer les documents possiblement mal classés et suggérer des L2
  complémentaires (`l2 audit`) ;
- recommander, pour chaque fiche service public, des L2 et des documents
  d'autres sources à lier (`l2 links recommend`) ;
- associer des questions libres à leurs thèmes L2 (`l2 questions theme`) ;
- rédiger une description publique de chaque rubrique (`l2 describe`).

Il n'alimente **pas** Metabase et ne tourne **pas** dans `ingest-all`. Les
sorties (`.xlsx`, `.json`) sont destinées à une relecture humaine avant
toute publication.

## Utilisation

Une seule commande, une sous-commande par étape, et **un seul format de sortie par étape** (json, xlsx…, jamais plusieurs au choix) (`uv run l2 --help`,
`uv run l2 <étape> --help`). Chaque étape lit des artefacts et en écrit
d'autres ; aucune n'en appelle une autre — l'ordre ci-dessous est celui des
dépendances de données. Il n'y a volontairement **pas** de « pipeline complet »
unique : chaque étape se relance seule (les étapes 1–3 sont lentes ou
payantes, les suivantes sont locales et rapides).

Artefacts sous `analysis/output/l2/` (ignoré par git), constantes de chemin
dans `paths.py`. `docs`/`facets` en CSV, `sessions`/`questions` en Parquet
(`io.py`).

| # | Commande | Entrées | Sorties | Accès externes |
|---|---|---|---|---|
| 1 | `l2 docs build` | Elasticsearch | `docs.csv`, `l2_l1.json` | ES, OpenAI (embeddings) |
| 1b | `l2 docs sync` | `docs.csv`, `facets.csv` + ES | mise à jour en place (seuls les documents changés sont ré-embarqués / ré-extraits) | ES, OpenAI, Claude |
| 2 | `l2 facets extract` | `docs.csv`, `l2_l1.json` | `facets_raw.csv` (+ checkpoint) | Claude (plusieurs heures) |
| 3 | `l2 facets embed` | `facets_raw.csv` | `facets.csv` | OpenAI ou Albert (`--provider`) |
| 4 | `l2 facets canonicalize` | `facets.csv` | `facets.csv` + colonne `canonical_facet` | — |
| 5 | `l2 sessions build` | `docs.csv` + Matomo | `visits.parquet`, `sessions.parquet` | Postgres Matomo (`PG_MATOMO_*`) |
| 6 | `l2 questions anonymize` | CSV de questions brutes | CSV anonymisé (emails, tél., IBAN, NIR, noms) | spaCy `fr_core_news_md` |
| 7 | `l2 questions embed` | CSV de questions | `questions.parquet` | OpenAI ou Albert |
| 8 | `l2 questions theme` | docs, facets, `l2_l1.json`, `questions.parquet` | `questions_themes.json` (`--sample N`) | — |
| 9 | `l2 describe` | docs, facets, `l2_l1.json` | `l2_descriptions.xlsx` | Claude |
| 10 | `l2 links recommend` | docs, facets (avec `canonical_facet`), `l2_l1.json` | `<source>_links.json` | — |
| 10b | `l2 links payload` | `<source>_links.json`, `l2_l1.json`, docs | `tagging_payload.json` (clair, ne pas publier) | — |
| 11 | `l2 links explain` | idem | diagnostic d'un document (pourquoi tel lien est / n'est pas proposé) | — |
| 12 | `l2 links fit-weights` | idem + `link_tags.csv` | rapport d'ajustement des poids (n'écrit rien) | — |
| 13 | `l2 audit` | docs, facets, `l2_l1.json` (+ `--sessions`) | `labelled_docs.xlsx` | — |

`l2 audit --embeddings-only docs.csv l2_l1.json` fait la même chose sans
facettes ni sessions (similarité d'embeddings de documents uniquement).

Enchaînement typique (de zéro) :

```bash
uv run l2 docs build
uv run l2 facets extract output/l2/docs.csv output/l2/l2_l1.json
uv run l2 facets embed output/l2/facets_raw.csv
uv run l2 facets canonicalize output/l2/facets.csv       # requis par `links`
uv run l2 links recommend output/l2/docs.csv output/l2/facets.csv output/l2/l2_l1.json
uv run l2 audit output/l2/docs.csv output/l2/facets.csv output/l2/l2_l1.json
```

Variables `.env` : `ELASTICSEARCH_SEARCH_ENGINE_*`, `OPENAI_*`, `ANTHROPIC_*`,
`ALBERT_*` (optionnel), `PG_MATOMO_*` (sessions). Les clients OpenAI/Claude
sont du HTTP brut (`analysis.connectors.openai`, `.claude`), sans SDK.

> **Les espaces d'embeddings de providers différents ne sont pas
> comparables.** Docs, facettes et questions sont comparés par similarité
> cosinus : régénérer `docs.csv` avec un autre provider impose de régénérer
> `facets.csv` et `questions.parquet` avec le même (`--provider`, défaut
> `openai`).

## Organisation du code

```
l2/
├── cli.py            # point d'entrée `l2` : une sous-commande -> le main() d'un module
├── config.py         # TOUS les seuils / poids / tailles de pool par défaut
├── paths.py          # dossier de sortie par défaut
├── io.py             # lecture/écriture des artefacts (CSV, Parquet, cache)
├── providers.py      # registre des providers d'embeddings (openai, albert)
├── facet_index.py    # index de facettes + appariement (partagé links / audit)
├── docs/             # build, sync            (étapes 1, 1b)
├── facets/           # extract, embed, canonicalize   (étapes 2-4)
├── sessions/         # build                  (étape 5)
├── questions/        # anonymize, embed, theme (étapes 6-8)
├── signatures/       # core (logique pure : signatures par L2), describe (étape 9)
├── links/            # scoring, candidates, render, recommend, explain, fit_weights, payload
├── audit/            # misclassification, complementary, run
└── legacy/           # code supersédé, hors CLI (voir ci-dessous)
```

Règles : la logique pure (sans réseau ni I/O) vit dans des modules
(`signatures/core.py`, `links/scoring.py`, `audit/*.py`…) ; chaque étape a un
`main(argv)` qui ne fait que parser les arguments, charger les artefacts,
appeler cette logique et écrire. Tout paramètre par défaut se règle dans
`config.py`, pas dans les modules.

### `legacy/`

Conservé pour référence, non exposé par `l2` (lancer avec
`python -m analysis.l2.legacy.<module>`) :

- `recommend_content` — ancien recommandeur document→document, remplacé par
  `links recommend` ;
- `coclick_preferences` — ajustement des poids à partir de préférences
  dérivées des co-clics (votes humains utilisés seulement en validation) ;
- `coclick_complementary` — ranking des L2 complémentaires par co-clics
  (remplacé par la variante contenu seul de `audit`).

## Outil de tagging

`analysis/tools/` (dépôt Git imbriqué, voir `tools/README.md`) publie une UI
statique où les relecteurs votent 👍/👎 sur les liens et valident les thèmes
de questions. `l2 links payload` écrit `tagging_payload.json` et
`l2 questions theme` écrit `questions_themes.json` ; ils se
chiffrent avec `tools/encrypt.mjs`. Les votes (`tools/votes/link_tags.csv`)
alimentent `l2 links fit-weights` et le réglage ci-dessous.

## Tests

```bash
uv run pytest src/analysis/l2/tests
```

Logique pure (signatures, réconciliation de `docs sync`, regex
d'anonymisation) et un test « golden » de `links recommend` sur un corpus
synthétique (`tests/golden_links.json`). Après un changement volontaire du
classement : `UPDATE_GOLDEN=1 uv run pytest src/analysis/l2/tests`.

## Réglage de `l2 links recommend` (config de référence)

Valeurs par défaut depuis le 2026-10-08, réglées sur les votes 👍/👎 de
l'outil de tagging (`tools/votes/link_tags.csv`, voir `tools/README.md`) :

| Paramètre | Valeur | Remarque |
|---|---|---|
| `--min-similarity` | **0.60** (avant : 0.75) | Seul changement mesuré : 0.75 écartait la moitié des liens votés « good » et laissait ~87 % des fiches sans lien document. Vaut aussi pour les candidats L2 (non évalués). |
| `--doc-top-k` | **3** (avant : 4) | Seuls 3 liens sont affichés. |
| `--similarity-metric` | `doc` | `facet` renvoie beaucoup plus de liens mais affiche des liens votés « bad » (1 à 4). |
| `--doc-pool` / `--l2-pool` / `--l2-top-k` | 12 / 8 / 2 | `--doc-pool` sans effet tant que le seuil coupe avant. `--l2-*` non évalués. |
| `--facet-basis` | `canonical` | Non évalué. |
| poids `combined_score` | recouvrement 0.15 · is_document 0.5 · affinité de source 0.2 · similarité 0.5 | Inchangés (voir ci-dessous). |

Résultat sur les 20 votes « good » / 9 votes « bad » (documents seuls,
top 3) : 15 « good » affichés sur 20, aucun « bad » affiché, ~1,5 lien
document par fiche, 193 fiches sur 510 sans lien document (les L2 complètent).
Pour comparaison, l'ancien run `alpha_1` (similarité `facet`, seuil 0.60,
top 4) affichait 13 « good » mais 7 « bad » sur 9 : c'est le choix de la
métrique de similarité, bien plus que `--doc-top-k`, qui explique l'essentiel
des différences entre les deux runs.

**Poids : volontairement non ajustés.** `l2 links fit-weights` ne bouge pas le
classement avec ces votes (hit@3 identique avant/après) : une vingtaine
d'exemples indépendants ne suffisent pas. Les poids ajustés et normalisés
(somme ramenée à celle des défauts, 0.85) donnaient recouvrement 0.198,
affinité 0.373, similarité 0.280 (`is_document` figé à 0.5) : plus
d'importance au même L2/L1, moins à la similarité brute. À reprendre quand il
y aura plus de votes.

**Biais à garder en tête.** Les votes portent sur des liens déjà affichés par
d'anciens runs (+ quelques ajouts manuels) : les bons liens jamais proposés
sont absents, donc les chiffres ci-dessus sont optimistes. Les candidats L2
ne sont pas évalués par l'ajustement.

**Refaire le réglage avec de nouveaux votes** (depuis `analysis/`) :

```bash
# 1. récupérer link_tags.csv à jour (dépôt de publication -> tools/votes/)
# 2. ajuster les poids : good = gagnants, bad = perdants explicites
uv run l2 links fit-weights output/l2/docs.csv output/l2/facets.csv output/l2/l2_l1.json \
    tools/votes/link_tags.csv                 # --regularization 8 par défaut, --no-normalize, --top-k 3
# 3. lire le rapport « ranking over ALL document candidates » : hit@3, MRR,
#    rang médian, liens bad affichés, défauts vs ajustés. N'adopter les poids
#    ajustés que si hit@3 monte ET que les deltas restent stables en
#    augmentant --regularization (essayer 8, 20, 50).
# 4. régénérer les liens (les défauts ci-dessus sont déjà ceux de la config de référence)
uv run l2 links recommend output/l2/docs.csv output/l2/facets.csv output/l2/l2_l1.json \
    --out output/l2/run_<nom>
    # puis `l2 links payload` + tools/encrypt.mjs pour republier l'UI de tagging
```

`l2 links fit-weights` n'évalue pas le seuil de similarité ni la taille du pool
(il score tous les candidats, sans seuil) : pour les comparer, régénérer les
liens avec chaque valeur et recompter les votes « good » / « bad » présents
dans le top 3. ``python -m analysis.l2.legacy.coclick_preferences`` accepte aussi `link_tags.csv`
(jeu de validation « hand-labeled », jamais entraîné dessus).
