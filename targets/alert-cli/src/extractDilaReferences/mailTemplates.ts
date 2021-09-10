import {
  createGetArticleReference,
  extractArticleId,
} from "@shared/dila-resolver";
import type { DocumentReferences, MailTemplate } from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { DilaApiClient } from "@socialgouv/dila-api-client";
import memoizee from "memoizee";
import pMap from "p-map";

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
    const articleIds =
      docData.document.references?.flatMap((ref) => {
        return extractArticleId(ref.url);
      }) ?? [];

    const references = await pMap(
      articleIds,
      async (id: string) => getArticleReference(id),
      { concurrency: 5 }
    );

    refs.push({
      document: {
        id: docData.initialId,
        source: SOURCES.LETTERS,
        title: docData.title,
      },
      references,
    });
  }
  return refs;
}

async function getMailTemplateReferences() {
  const letters = (await getAllDocumentsBySource(
    SOURCES.LETTERS
  )) as MailTemplateSubset[];
  const documentReferences = await extractMailTemplateRef(letters);
  console.log(documentReferences);
  return documentReferences;
}

export default memoizee(getMailTemplateReferences, { promise: true });
