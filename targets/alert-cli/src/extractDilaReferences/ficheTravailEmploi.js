import { SOURCES } from "@socialgouv/cdtn-sources";

import { getAllDocumentsBySource } from "./getAllDocumentsBySource";

/**
 *
 * @param {import("@shared/types").FicheTravailEmploiDocument[]}  fiches
 */
export function extractFicheTravailEmploiRef(fiches) {
  /** @type {alerts.DocumentReferences[]} */
  const references = [];

  for (const fiche of fiches) {
    fiche.document.sections.forEach((section) => {
      references.push({
        document: {
          id: fiche.id,
          source: SOURCES.SHEET_MT,
          title: `${fiche.title}#${section.anchor}`,
        },
        references: section.references,
      });
    });
  }
  return references;
}

export default async function main() {
  /** @type {import("@shared/types").FicheTravailEmploiDocument[]} */
  const fiches = await getAllDocumentsBySource(SOURCES.SHEET_MT_PAGE);
  return extractFicheTravailEmploiRef(fiches);
}
