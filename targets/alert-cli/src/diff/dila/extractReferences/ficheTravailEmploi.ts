import type { DocumentReferences, FicheTravailEmploi } from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import memoizee from "memoizee";

import { getAllDocumentsBySource } from "../../shared/getAllDocumentsBySource";

let references: DocumentReferences[] = [];

export type FicheTravail = Pick<
  FicheTravailEmploi,
  "document" | "source" | "title"
> & {
  initialId: string;
  cdtnId: string;
};

export function extractFicheTravailEmploiRef(
  fiches: FicheTravail[]
): DocumentReferences[] {
  const refs: DocumentReferences[] = [];

  for (const fiche of fiches) {
    fiche.document.sections.forEach((section) => {
      refs.push({
        document: {
          id: fiche.initialId,
          source: SOURCES.SHEET_MT,
          title: `${fiche.title}#${section.anchor}`,
        },
        references: section.references.map(
          ({ cid: dila_cid, title, url, id: dila_id }) => ({
            dila_cid,
            dila_container_id: "LEGITEXT000006072050",
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

async function getFicheTravailEmploiReferences(): Promise<
  DocumentReferences[]
> {
  const fiches = (await getAllDocumentsBySource([
    SOURCES.SHEET_MT_PAGE,
  ])) as FicheTravail[];
  references = extractFicheTravailEmploiRef(fiches);
  return references;
}

export default memoizee(getFicheTravailEmploiReferences, { promise: true });
