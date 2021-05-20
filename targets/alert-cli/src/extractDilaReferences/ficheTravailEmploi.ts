import type { FicheTravailEmploi } from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";

import type { DocumentReferences } from "../types";
import { getAllDocumentsBySource } from "./getAllDocumentsBySource";

let references: DocumentReferences[] = [];

export type FicheTravail = Pick<
  FicheTravailEmploi,
  "document" | "source" | "title"
> & {
  id: string;
  cdtnId: string;
};

export function extractFicheTravailEmploiRef(fiches: FicheTravail[]) {
  const refs: DocumentReferences[] = [];

  for (const fiche of fiches) {
    fiche.document.sections.forEach((section) => {
      refs.push({
        document: {
          id: fiche.id,
          source: SOURCES.SHEET_MT,
          title: `${fiche.title}#${section.anchor}`,
        },
        references: section.references.map(
          ({ cid: dila_cid, title, url, id: dila_id }) => ({
            dila_cid,
            dila_id,
            title,
            url,
          })
        ),
      });
    });
  }
  return refs;
}

export default async function main(): Promise<DocumentReferences[]> {
  if (references.length === 0) {
    const fiches = (await getAllDocumentsBySource(
      SOURCES.SHEET_MT_PAGE
    )) as FicheTravail[];
    references = extractFicheTravailEmploiRef(fiches);
  }
  return references;
}
