"""Segments Matomo partagés entre reports.

Centralise les expressions de segment réutilisées, pour éviter qu'elles divergent
d'un report à l'autre (typiquement la définition de « mobile »).
"""

from __future__ import annotations

# Ventilation par type d'appareil. « mobile » regroupe smartphones ET tablettes
# (`,` = OU dans un segment Matomo). À réutiliser par tout report qui ventile une
# métrique par device plutôt que de redéfinir un dict local.
DEVICE_SEGMENTS: dict[str, str] = {
    "desktop": "deviceType==desktop",
    "mobile": "deviceType==smartphone,deviceType==tablet",
}
