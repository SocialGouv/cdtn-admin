import type { FicheIndex } from "@socialgouv/fiches-vdd-types";

/**
 * Return a filtered set of FicheIndex
 */
export function filter(includeFicheId: string[], fiches: FicheIndex[]) {
  const filteredFiches = fiches.filter((fiche) => {
    const arianeIds = fiche.breadcrumbs.map((item) => item.id);
    if (!fiche.id.startsWith("F")) {
      return false;
    }

    /**  @param {string} id */
    const matchFilDAriane = (id: string) => arianeIds.includes(id);

    return includeFicheId.some(matchFilDAriane);
  });

  const particuliers = filteredFiches.filter(
    ({ type }) => type === "particuliers"
  );
  const professionnels = filteredFiches
    .filter(({ type }) => type === "professionnels")
    .filter(({ id }) =>
      particuliers.every(({ id: particulierId }) => particulierId !== id)
    );

  const associations = filteredFiches
    .filter(({ type }) => type === "associations")
    .filter(({ id }) =>
      particuliers.every(({ id: particulierId }) => particulierId !== id)
    )
    .filter(({ id }) =>
      professionnels.every(({ id: professionnelId }) => professionnelId !== id)
    );

  return particuliers.concat(professionnels, associations);
}
