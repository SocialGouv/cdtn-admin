import { client } from "@shared/graphql-client";
import { SOURCES } from "@socialgouv/cdtn-sources";

/**
 * Return a filtered set of FicheIndex based on the existing db set
 * @param {import("@socialgouv/fiches-vdd-types").FicheIndex[]} fiches
 */
export async function filter(fiches) {
  const result = await client
    .query(
      `
      query sheetSP_documents {
        documents(where: {source: {_eq: "${SOURCES.SHEET_SP}"}}) {
          initialId: initial_id
        }
      }
    `
    )
    .toPromise();

  if (result.error) {
    console.error(result.error);
    throw new Error(`error while retrieving current list of sheet SP`);
  }

  const currentFichesId = result.data.documents.map(
    /**
     * @param {{initialId:string}} document
     * @returns {string}
     */
    ({ initialId }) => initialId
  );

  const filteredFiches = fiches.filter((fiche) => {
    currentFichesId.includes(fiche.id);
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
