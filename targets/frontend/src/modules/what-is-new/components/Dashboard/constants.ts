import type { WhatIsNewItemKind } from "../../api/whatIsNewItems.query";

export const kindOptions: Array<{ value: WhatIsNewItemKind; label: string }> = [
  { value: "mise-a-jour-fonctionnelle", label: "Mise à jour fonctionnelle" },
  { value: "evolution-juridique", label: "Évolution juridique" },
];

export const kindLabel: Record<WhatIsNewItemKind, string> = {
  "mise-a-jour-fonctionnelle": "Mise à jour fonctionnelle",
  "evolution-juridique": "Évolution juridique",
};
