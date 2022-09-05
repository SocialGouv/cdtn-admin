# Explorations de données

Séries de notebook afin d'explorer les données des documents du code du travail numérique.
Ce dossier est en python et contient notamment
- Exploration de données sur les modèles de Machine Learning utilisables dans elasticsearch pour le moteur de recherche
- Exploration de données pour la recherche hybride (full text + sémantique)

## Quickstart

Pour faciliter l'installation de l'environnement de développement, un [Makefile](Makefile) automatise certaines actions
que vous pouvez découvrir grâce à la commande suivante :
```shell
$ make help
```

### Création de l'environnement Conda

Le projet utilise `conda` pour gérer les environnements virtuels Python : [Guide d'installation Miniconda](https://docs.conda.io/en/latest/miniconda.html).

Si vous êtes sur MacOS, la manière la plus directe d'installer `conda` est Homebrew :
```shell
$ brew install --cask miniconda
```

Vous aurez aussi besoin de `postgresql` pour lancer le projet. Si vous êtes sur MacOS, la manière la plus directe d'installer `postgresql` est Homebrew :
```shell
$ brew install postgresql
```

Une fois Miniconda installé, créez et activez un environnement virtuel Python lié au projet :
```shell
$ make conda_env
```

Vous pouvez désormais entrer dans l'environnement tout juste créé :
```shell
$ source explorations-cdtn/bin/activate
```

### Installation des dépendances

Vous pouvez désormais installer l'ensemble des dépendances du projet dans un environnement isolé.
La commande suivante vous permet d'installer :
1. Le package du projet en mode développement
2. Les dépendances liées au développement (libraries de test, etc.)
```shell
$ make dependencies
```


### Lancer un job
Avant toute chose, pensez à copier-coller le fichier `env.example` dans un fichier `env` à ne surtout pas ajouter à git.
Ce fichier contiendra les variables nécessaires à la configuration de votre environnement local. Vous pouvez obtenir un exemple auprès d'un autre développeur de l'équipe.

