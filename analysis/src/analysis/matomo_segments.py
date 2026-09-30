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

# Le réplica SQL Matomo (table ``matomo_partitioned``) n'expose pas ``deviceType`` :
# les segments ci-dessus ne s'y appliquent pas. On y déduit le device de l'OS
# (convention des notebooks : « mobile » = iOS ou Android, tablettes comprises).
MOBILE_OS: frozenset[str] = frozenset({"iOS", "Android"})


def device_from_os(operating_system: str | None) -> str:
    """Retourne la clé de ``DEVICE_SEGMENTS`` (desktop / mobile) d'après l'OS."""
    return "mobile" if operating_system in MOBILE_OS else "desktop"
