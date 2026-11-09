---
name: add-metabase-analysis
description: >-
  Point d'entrée pour TOUTE demande d'analyse de données du CDTN par le PO :
  « J'ai besoin d'une analyse… », « peux-tu analyser… », « je voudrais savoir
  combien/quel taux… », « sors-moi les chiffres de… », « on a la donnée sur… ? ».
  Utilise ce skill dès qu'une analyse, un chiffre, un taux, un graphique ou un
  indicateur sur le site (visites, contenus, contributions, simulateurs, actualités,
  fiches, modèles de courrier, NPS, A/B tests) est demandé, même sans mentionner
  Metabase, un dashboard ou un notebook. Il cherche d'abord la donnée dans les
  tables agrégées alimentées par `analysis/` ; si elle existe, il construit la carte
  dans le dashboard Metabase du CDTN (par défaut le dashboard 71 « Tableau de bord du
  CDTN - Refonte juillet 2026 »). Sinon il demande si le besoin est ponctuel (→ génère
  et lance un notebook Python) ou récurrent (→ fiche de besoin pour l'équipe dev).
  Aussi pour : ajouter/modifier une carte ou un KPI dans Metabase, ou vérifier si
  une donnée est déjà disponible. Pour créer l'agrégat Python lui-même (côté dev),
  c'est le skill `add-analysis-report`, pas celui-ci.
---

# Ajouter une analyse dans Metabase (pour le PO)

Le PO exprime un besoin d'analyse en langage métier. Ce skill décide **où trouver
la donnée**, puis soit **construit la carte dans Metabase**, soit **génère un
notebook one shot**, soit **oriente vers l'équipe dev**. Les trois issues sont
légitimes : le but n'est pas de toujours produire une carte, mais de ne jamais
inventer une donnée ni créer une dépendance fragile.

## Ton et posture

Le PO n'est pas développeur. Parle en français simple, sans jargon (« la table
`parcours_actualites` » → « les données de parcours après une actualité »). Cite
les noms techniques seulement quand ils servent (ex. pour les devs). Reformule
le besoin avant d'agir, annonce clairement dans quelle des trois issues on part, et
explique **pourquoi**.

## Toujours valider la méthode avec le PO, en termes simples, avant d'implémenter

Avant d'écrire la moindre requête, carte ou notebook, **explique au PO, en une
courte phrase sans jargon, ce que tu vas calculer et sur quelle donnée**, puis
attends son feu vert. Le PO connaît le métier : c'est lui qui voit si la méthode
répond vraiment à sa question (ou s'il manque un filtre, un cas à exclure, une
vérification). Ça vaut pour les trois issues (carte, notebook, fiche dev) et pour
chaque nouvelle analyse, même une petite.

Dis :

- **ce que tu comptes** (l'unité : visites, visiteurs, pages vues, clics…) ;
- **d'où ça vient** (quelles données / quel événement du site) ;
- **comment** (somme, taux, évolution…), sur **quelle période** et **quelle
  ventilation** ;
- **les choix qui peuvent changer le chiffre** (ce qu'on exclut, comment on
  traite les doublons, l'ordre des actions).

Exemple. Le PO demande « le nombre d'utilisateurs qui ont fait une recherche sur
le site » :

> Je vais compter les **événements « recherche »** enregistrés dans les données de
> visites, sur les 90 derniers jours, ventilés par desktop/mobile. Attention : ça
> compte des **recherches**, pas des personnes. Si vous voulez le nombre de
> **visites** ayant fait au moins une recherche, je ne les compte qu'une fois par
> visite. Laquelle des deux voulez-vous ? Y a-t-il des recherches à exclure
> (recherche vide, test…) ou une autre vérification à faire ?

Termine toujours en invitant le PO à **valider, corriger ou ajouter des
vérifications / calculs**. Ne démarre l'implémentation qu'après sa réponse. S'il
corrige, reformule la méthode mise à jour et revalide si le changement est
important. Reste en langage métier : pas de nom de table ni de SQL dans cette
validation (le SQL détaillé n'est montré qu'à l'étape de création de la carte,
en complément, pour transparence).

## Les données disponibles : tables agrégées uniquement

Les cartes du dashboard lisent des **tables agrégées** (une ligne par jour ×
dimensions), alimentées chaque nuit par `analysis/` (`ingest-all`, données à J-2).
Elles sont dans la base Metabase nommée **« OVH PG CDTN » (id 4)**, avec des cartes
en **SQL natif**. **Ne requête jamais le réplica Matomo depuis Metabase** (la base
« Matomo », id 3) : trop lourd et hors du modèle « agrégats + calcul des taux dans
Metabase » voulu par l'équipe.

Sources de vérité, à lire (ne te fie pas à ta mémoire, les tables évoluent) :

1. `analysis/README.md` section « Reports disponibles » : rôle de chaque table,
   comptage, formules des taux.
2. Les `_CREATE_TABLE` de `analysis/src/analysis/commands/ingest_*.py` : colonnes
   exactes et clé primaire.
3. Optionnel, pour confirmer que la table existe bien côté Metabase : voir
   `references/metabase-browser.md` (« Lister les tables »).

Règles de calcul propres à ces tables (les oublier donne des chiffres faux) :

- **Les taux ne sont pas stockés.** On somme les compteurs sur la période **puis**
  on divise (`SUM(a) / NULLIF(SUM(b), 0)`), jamais une moyenne de taux journaliers.
- Les compteurs sont des **visites** : une visite peut compter dans plusieurs
  types de contenu, donc ne pas sommer les `content_type` pour avoir un total
  (utiliser `visites_totales`).
- `device` vaut `desktop` ou `mobile` (mobile = iOS/Android, tablettes incluses).
- Convention des cartes existantes : fenêtre `date >= current_date - interval '90
  days' AND date < current_date`. Reprends-la sauf demande contraire.

## Étape 1 — Comprendre le besoin

Obtiens (en posant les questions manquantes, regroupées, sans noyer le PO) :

- **La question métier** : que veut-on savoir ou décider avec ça ?
- **La mesure** : un nombre, un taux, une évolution ? Sur quel contenu (actualités,
  contributions, simulateurs, fiches SP, modèles de courrier…) ?
- **Ventilation et période** : par device, par contenu, par semaine/mois ? 90
  derniers jours ?
- **Restitution** : indicateur (scalaire avec comparaison), courbe, barres,
  tableau, funnel ? Dans quel **onglet** du dashboard ?

Si le PO ne sait pas pour la restitution, propose un défaut cohérent avec les
cartes voisines (lis-les, voir étape 3).

## Étape 2 — La donnée existe-t-elle ?

Fais l'inventaire : pour chaque mesure et chaque dimension demandée, trouve la
colonne (ou la combinaison de colonnes) qui la fournit. Trois cas :

- **Tout est disponible** → étape 3.
- **Une partie manque** (une dimension absente, une métrique jamais agrégée, un
  contenu non suivi) → dis exactement **ce qui manque** et ce qui reste faisable
  sans, puis demande :

  > « Ce besoin est-il **ponctuel** (une analyse à un instant donné) ou
  > **récurrent** (on veut le voir évoluer dans le dashboard) ? »

  - **Ponctuel (one shot)** → étape 4 : notebook Python.
  - **Récurrent** → étape 5 : on ne contourne pas, on redirige vers les devs.
  - Le PO hésite → explique la différence : un suivi dans le temps exige une
    nouvelle donnée agrégée chaque nuit (travail dev) ; une réponse ponctuelle
    se fait dans un notebook, une fois.
- **Rien n'est disponible** → même question ponctuel / récurrent.

Dans tous les cas où la donnée est absente, **ne crée rien dans Metabase** : une
carte sur une table qui n'existe pas, ou une requête directe sur Matomo, est
exactement ce que ce skill doit éviter.

## Étape 3 — Construire la carte dans Metabase

Accès **par le navigateur** (Claude in Chrome, session Metabase déjà connectée du
PO). Lis `references/metabase-browser.md` : il contient la mise en route, les
recettes (lire le dashboard, valider une requête, créer une carte, la placer) et
les pièges. Principe : on pilote Metabase **depuis la page** avec des appels
d'API (`javascript_tool` + `fetch`, cookies de session) plutôt qu'en cliquant dans
l'interface, ce qui est bien plus fiable ; l'interface sert à vérifier et de
repli.

Déroulé :

1. **Lire les voisines** : ouvre le dashboard (71 par défaut, sauf autre lien du
   PO), repère l'onglet cible et 2-3 cartes proches : style de SQL, type de
   visualisation, dimensions, collection où elles sont rangées, et la grille
   (position/taille). Une carte nouvelle doit ressembler aux existantes.
2. **Écrire le SQL natif** sur la base 4, dans le style des voisines (alias en
   français, `NULLIF` sur les dénominateurs, somme puis division, fenêtre 90
   jours).
3. **Le valider avant de créer quoi que ce soit** : exécute-le (recette « valider
   une requête ») et regarde les lignes. Vérifie que les chiffres sont
   plausibles (taux entre 0 et 1, totaux cohérents avec une carte voisine). Si le
   résultat est vide, ne publie pas : cherche pourquoi (voir la note sur la date
   de début des données dans les mémoires, ex. NPS).
4. **Montrer au PO et obtenir son accord** avant toute écriture (en plus de la
   validation de méthode faite avant d'écrire le SQL) : la question posée, le SQL
   en clair, un aperçu des premières lignes, le type de graphique, l'onglet et
   l'emplacement prévus. L'ajout au dashboard est visible de toute
   l'équipe : c'est le moment de valider, pas après.
5. **Créer la carte puis l'ajouter au dashboard** (recettes du fichier de
   référence), **en sauvegardant d'abord le dashboard** : la mise à jour du
   dashboard remplace la liste complète des cartes, une erreur peut en effacer.
6. **Vérifier** : recharge l'onglet, contrôle la carte (capture d'écran), qu'elle
   n'a pas décalé les autres, et donne au PO le lien direct vers l'onglet.

Ne modifie ni ne supprime jamais une carte existante qui n'est pas celle qu'on
vient de créer, sauf demande explicite du PO pour cette carte précise.

## Étape 4 — Besoin ponctuel : notebook Python

Quand la donnée manque et que le PO confirme un besoin one shot, **tu génères le
notebook complet** et tu **le lances pour lui** (Jupyter), en lui donnant le lien.

0. **Valide d'abord la méthode** avec le PO en termes simples (section dédiée
   plus haut) : quels events, quelle unité de comptage, quelles exclusions.
1. **Lis `references/matomo-notebook-context.md`** : schéma de la table Matomo,
   règles de la donnée, patron de chargement, et surtout la liste des points sur
   lesquels **poser des questions avant d'écrire** (ordre des events, noms exacts,
   unité de comptage, périmètre). Consulte le plan de tracking et fais confirmer
   les events au PO : ne devine pas un ordonnancement.
2. Quand le besoin est clair et validé, crée le squelette puis complète-le
   (contenu attendu dans `references/notebook-oneshot.md`) :

```bash
python3 .claude/skills/add-metabase-analysis/scripts/new_notebook.py \
  --theme "<Thème>" --name "<nom_court_snake_case>" --title "<Titre lisible>" \
  --question "<la question du PO>"
```

   Le fichier est créé dans `analysis/notebooks/Analyses/<Thème>/<JJMMAAAA>_<nom>.ipynb`.
   Requêtes SQL simples (`WHERE` seulement), calcul en pandas.
3. **Lance Jupyter** et donne le lien direct au PO : `references/notebook-oneshot.md`,
   section « Lancer Jupyter pour le PO » (`uv sync`, contrôle du `.env` sans
   exposer les identifiants, `uv run jupyter lab --no-browser` en arrière-plan,
   lien avec jeton).
4. Ne présente jamais un résultat que tu n'as pas obtenu ; si tu n'as pas pu
   exécuter le notebook, dis-le.

## Étape 5 — Besoin récurrent : rediriger vers l'équipe dev

Ne crée ni report, ni table, ni carte. Prépare une **fiche de besoin** que le PO
transmettra aux devs, pour qu'ils réfléchissent à la structure des données
agrégées (c'est leur arbitrage : granularité, dimensions, volumétrie, coût de
calcul). Contenu :

- **Question métier** et décision que ça éclaire.
- **Mesure(s)** souhaitée(s) et formule des taux si pertinent.
- **Dimensions** de ventilation (device, contenu, type de référent…) et **liste
  exacte des contenus** à suivre si le besoin porte sur des pages précises.
- **Fréquence / historique** voulus (suivi quotidien ? rattrapage sur 1 an ?).
- **Ce qui existe déjà** dans les tables agrégées et ce qui manque précisément.
- **Restitution cible** dans Metabase (type de carte, onglet).

Précise aux devs que l'ajout se fait avec le skill `add-analysis-report`. Une fois
la table alimentée, le PO pourra revenir ici pour la carte (étape 3).

Propose de sauvegarder la fiche (par exemple dans un ticket GitHub) mais ne crée
pas le ticket sans accord.

## Checklist avant de répondre « c'est fait »

- [ ] Le besoin est reformulé et validé par le PO.
- [ ] La méthode (ce qu'on compte, d'où, comment) a été expliquée en termes simples et validée **avant** d'implémenter.
- [ ] Chaque mesure/dimension a été rattachée à une colonne réelle (ou signalée manquante).
- [ ] Carte : SQL exécuté et résultat contrôlé ; accord du PO obtenu avant écriture.
- [ ] Carte : dashboard sauvegardé avant modification ; aucune autre carte touchée.
- [ ] Carte : vérifiée à l'écran sur l'onglet, lien fourni.
- [ ] Notebook : events/ordre confirmés avec le PO, fichier créé, Jupyter lancé et lien donné, aucun résultat inventé.
- [ ] Récurrent : fiche de besoin fournie, rien créé côté Metabase ni Python.
