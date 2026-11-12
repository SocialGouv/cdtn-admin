# Notebook one shot pour le PO

Un notebook one shot répond à une question **ponctuelle** que les tables agrégées
ne couvrent pas. Il interroge le **réplica SQL Matomo** (lecture seule) ; il ne
touche pas à Metabase ni à la base d'agrégats.

## Ce qu'il doit contenir

Le script `scripts/new_notebook.py` génère le squelette. Complète-le en gardant
cette structure, pensée pour quelqu'un qui n'est pas développeur :

1. **Titre + question posée** (markdown) : ce que le notebook cherche à savoir.
2. **Mode d'emploi en 3 lignes** : « Exécuter toutes les cellules (menu _Run → Run
   All Cells_). Les paramètres sont dans la cellule _Paramètres_. »
3. **Paramètres** (une seule cellule, en tête) : dates de début/fin, liste de slugs
   ou de pages, etc. Le PO ne doit modifier que ça.
4. **Connexion** : `MatomoSQLConnectorSync` (synchrone ; ne pas utiliser le
   connecteur async dans du nouveau code).
5. **Requête** : SQL **simple** et paramétré (`%s`, jamais de valeurs concaténées) :
   un `WHERE`, **pas de `JOIN` / `GROUP BY` / sous-requête** — le calcul (visites
   distinctes, ordre des events, taux) se fait ensuite en **pandas**. Les règles
   de la table (`action_type`, `idvisit`, `actions`, device, `experiments`) sont
   dans `matomo-notebook-context.md`. Inspire-toi de `analysis/src/analysis/reports/`
   (`_parcours.py`, `completion_modeles_courrier.py`) pour reconstruire des
   séquences de visite.
6. **Résultat lisible** : un `DataFrame` affiché + au besoin un graphique simple
   (matplotlib/pandas `.plot`), avec titres et libellés en français.
7. **Lecture du résultat** (markdown) : une cellule vide « Conclusions » que le PO
   peut remplir, ou quelques phrases d'interprétation **uniquement après** que le
   PO a exécuté et partagé le résultat.
8. **Export CSV optionnel** vers `analysis/output/` (dossier déjà prévu).

Garde le notebook court et linéaire (pas de fonctions inutiles). Une requête par
fenêtre de temps raisonnable : sur de longues périodes, boucle par jour comme dans
les notebooks existants plutôt qu'une seule requête énorme sur la réplique.

## Où le ranger

`analysis/notebooks/Analyses/<Thème>/<JJMMAAAA>_<nom>.ipynb` (thèmes existants :
`Contributions`, `Accords entreprise`, `Convention collective` ; crée-en un si
besoin). Préfixe de date = date de création (convention actuelle des fichiers).

## Lancer Jupyter pour le PO (c'est toi qui le fais)

Ne demande pas au PO de taper des commandes : fais-les, puis donne-lui le lien.

1. **Installer** (idempotent) : `cd analysis && uv sync`. Si `uv` est absent, dis-le
   au PO (installation : https://docs.astral.sh/uv/getting-started/installation/).
2. **Vérifier `analysis/.env`** : le fichier doit exister et contenir les
   `PG_MATOMO_*` renseignés (teste la présence des clés, **sans afficher ni
   répéter les valeurs**). S'il manque, copie `.env.example` en `.env` si besoin,
   puis demande au PO de renseigner `PG_MATOMO_*` lui-même dans ce fichier (valeurs
   à demander à l'équipe dev). Ne saisis jamais d'identifiants à sa place, et ne
   les demande pas dans le chat.
3. **Démarrer JupyterLab en arrière-plan**, sans ouvrir de navigateur, et lis sa
   sortie pour récupérer l'URL avec son jeton :

   ```bash
   cd analysis && uv run jupyter lab --no-browser
   ```

   (Bash avec `run_in_background: true`.) Dans les premières lignes de sortie,
   repère l'URL `http://localhost:<port>/lab?token=…` (le port peut différer de
   8888 s'il est pris). Si un JupyterLab tourne déjà pour ce projet, réutilise-le
   plutôt que d'en lancer un second.

4. **Donne le lien direct vers le notebook** : `http://localhost:<port>/lab/tree/notebooks/Analyses/<Thème>/<fichier>.ipynb?token=…`
   (le dossier racine du serveur est `analysis/`). Le lien contient un jeton : ne
   le partage nulle part ailleurs que dans cette conversation.
5. **Dis comment l'utiliser** et comment l'arrêter :

   > Ouvrez ce lien, puis menu **Run → Run All Cells**. Ajustez d'abord la cellule
   > **Paramètres** (dates…) si besoin. Un export CSV est écrit dans `analysis/output/`.
   > Quand vous avez fini, dites-le-moi et j'arrête JupyterLab.

   Arrête le serveur (`TaskStop`) quand le PO a terminé ou à la fin de la session.

Tu peux aussi **exécuter le notebook toi-même** pour vérifier qu'il tourne (par
ex. `uv run jupyter nbconvert --to notebook --execute …` vers un fichier de sortie
séparé), mais seulement si `.env` est correctement renseigné. Si tu l'as fait,
tu peux commenter le résultat obtenu. Sinon, ne présente aucun résultat que tu
n'as pas vu. Si une cellule échoue pour une raison de connexion, c'est le `.env` :
renvoie le PO vers l'équipe dev.

Si le PO se rend compte qu'il veut finalement suivre cette mesure dans le temps,
c'est un besoin récurrent → étape 5 du skill (fiche pour les devs).
