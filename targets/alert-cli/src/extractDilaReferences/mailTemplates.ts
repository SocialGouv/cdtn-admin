import {
  createGetArticleReference,
  extractArticleId,
} from "@shared/dila-resolver";
import type { DocumentReferences, MailTemplate } from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { DilaApiClient } from "@socialgouv/dila-api-client";
import memoizee from "memoizee";

import { batchPromises } from "../batchPromises";
import { getAllDocumentsBySource } from "./getAllDocumentsBySource";

export type MailTemplateSubset = Pick<
  MailTemplate,
  "document" | "source" | "title"
> & {
  initialId: string;
  cdtnId: string;
};

const getArticleReference = createGetArticleReference(new DilaApiClient());

export async function extractMailTemplateRef(
  mailTemplates: MailTemplateSubset[]
): Promise<DocumentReferences[]> {
  const refs: DocumentReferences[] = [];

  for (const docData of mailTemplates) {
    if (!docData.document.references?.length) {
      continue;
    }

    const articleIds = docData.document.references.flatMap(extractArticleId);

    const references = await batchPromises(
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */
      articleIds,
      async (id) => getArticleReference(id),
      5
    );
    refs.push({
      document: {
        id: docData.initialId,
        source: SOURCES.LETTERS,
        title: docData.title,
      },
      references: references.flatMap((item) => {
        if (item.status === "fulfilled") return item.value;
        return [];
      }),
    });
  }
  return refs;
}

async function getMailTemplateReferences() {
  const letters = (await getAllDocumentsBySource(
    SOURCES.LETTERS
  )) as MailTemplateSubset[];
  const documentReferences = await extractMailTemplateRef(letters);
  return documentReferences;
}

export default memoizee(getMailTemplateReferences, { promise: true });
