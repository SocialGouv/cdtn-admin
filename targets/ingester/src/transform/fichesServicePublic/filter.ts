import type { FicheIndex } from "@socialgouv/fiches-vdd-types";

/**
 * Return a filtered set of FicheIndex
 */

export function filter(
  includeFicheId: string[],
  fiches: FicheIndex[]
): FicheIndex[] {
  // we sort fiche by type (particuliers , professionnels, associations)
  // so when searching for a document we can take the first one
  // that match the given id

  const sorted = fiches.slice().sort((ficheA, ficheB) => {
    if (ficheA.type === ficheB.type) {
      return parseInt(ficheA.id) - parseInt(ficheB.id);
    }
    const values = {
      associations: 2,
      particuliers: 0,
      professionnels: 1,
    };
    return values[ficheA.type] - values[ficheB.type];
  });
  return includeFicheId.flatMap((id) => {
    if (!id.startsWith("F")) return [];
    return sorted.find((item) => item.id === id) ?? [];
  });
}
