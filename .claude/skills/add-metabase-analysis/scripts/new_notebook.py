#!/usr/bin/env python3
"""Crée le squelette d'un notebook one shot sous analysis/notebooks/Analyses/.

Utilise uniquement la bibliothèque standard (pas besoin de l'environnement uv).
Usage :
    python3 new_notebook.py --theme Contributions --name taux_x \
        --title "Taux X" --question "Quel est le taux X ?"
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path


def _repo_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / "analysis" / "notebooks").is_dir():
            return parent
    sys.exit("Racine du dépôt introuvable (dossier analysis/notebooks manquant).")


def _slug(text: str) -> str:
    ascii_text = (
        unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    )
    return re.sub(r"[^a-z0-9]+", "_", ascii_text.lower()).strip("_") or "analyse"


def _md(source: str) -> dict:
    return {"cell_type": "markdown", "metadata": {}, "source": source.splitlines(True)}


def _code(source: str) -> dict:
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": source.splitlines(True),
    }


def build(title: str, question: str) -> dict:
    cells = [
        _md(
            f"# {title}\n\n"
            f"**Question :** {question}\n\n"
            "**Mode d'emploi :** menu *Run → Run All Cells*. Ne modifier que la "
            "cellule *Paramètres*. Source : visites Matomo (réplica SQL, lecture seule)."
        ),
        _code("%load_ext dotenv\n%dotenv"),
        _md("## Paramètres"),
        _code(
            "# À adapter. Dates incluses, au format AAAA-MM-JJ.\n"
            'DATE_DEBUT = "2026-10-01"\n'
            'DATE_FIN = "2026-10-31"'
        ),
        _md("## Requête"),
        _code(
            "import pandas as pd\n"
            "from analysis.connectors.matomo import MatomoSQLConnectorSync\n"
            "from analysis.matomo_segments import device_from_os\n"
            "\n"
            "# TODO : adapter colonnes, filtres et calcul (voir analysis/src/analysis/reports/).\n"
            "# Requête simple : un WHERE, pas de JOIN / GROUP BY / sous-requête ;\n"
            "# le calcul se fait en pandas. Valeurs en paramètres %s, jamais concaténées.\n"
            'COLUMNS = ["idvisit", "actions", "operatingsystemname", "action_type", "action_url"]\n'
            'QUERY = f"""\n'
            'SELECT {", ".join(COLUMNS)} FROM matomo_partitioned\n'
            "WHERE action_timestamp >= %s\n"
            "  AND action_timestamp < %s::date + 1\n"
            "  AND action_type = 'action'\n"
            "ORDER BY action_timestamp ASC\n"
            '"""\n'
            "\n"
            "with MatomoSQLConnectorSync() as matomo:\n"
            "    brut = matomo.run_query_df(QUERY, (DATE_DEBUT, DATE_FIN))\n"
            "\n"
            'brut["device"] = brut["operatingsystemname"].map(device_from_os)\n'
            'resultat = (\n'
            '    brut.groupby("device")["idvisit"].nunique().rename("nb_visites").reset_index()\n'
            ")\n"
            "resultat"
        ),
        _md("## Résultat"),
        _code(
            "# Graphique simple (adapter titres et libellés).\n"
            'resultat.plot.bar(x="device", y="nb_visites", legend=False,\n'
            '                  title="À adapter", xlabel="", ylabel="Visites");'
        ),
        _md("## Export CSV (optionnel)"),
        _code(
            "from pathlib import Path\n"
            "\n"
            'sortie = Path("../../../output") / "RESULTAT.csv"  # chemin relatif au notebook\n'
            "sortie.parent.mkdir(parents=True, exist_ok=True)\n"
            "resultat.to_csv(sortie, index=False)\n"
            "sortie.resolve()"
        ),
        _md("## Conclusions\n\n_À compléter après lecture du résultat._"),
    ]
    return {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3",
            },
            "language_info": {"name": "python"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--theme", required=True, help="Sous-dossier de Analyses/")
    parser.add_argument("--name", required=True, help="Nom court du notebook")
    parser.add_argument("--title", required=True, help="Titre lisible")
    parser.add_argument("--question", required=True, help="Question du PO")
    args = parser.parse_args()

    root = _repo_root()
    theme_dir = root / "analysis" / "notebooks" / "Analyses" / args.theme
    theme_dir.mkdir(parents=True, exist_ok=True)
    path = theme_dir / f"{date.today():%d%m%Y}_{_slug(args.name)}.ipynb"
    if path.exists():
        sys.exit(f"Le fichier existe déjà : {path}")
    path.write_text(
        json.dumps(build(args.title, args.question), ensure_ascii=False, indent=1)
        + "\n",
        encoding="utf-8",
    )
    print(path.relative_to(root))


if __name__ == "__main__":
    main()
