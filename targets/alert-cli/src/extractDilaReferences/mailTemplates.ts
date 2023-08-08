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
import { WarningRepository } from "../repositories/WarningRepository";
import { client } from "@shared/graphql-client";

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
  const repo = new WarningRepository(client);
  const refs: DocumentReferences[] = [];

  for (const docData of mailTemplates) {
    const articleIds =
      docData.document.references?.flatMap((ref) => {
        return extractArticleId(ref.url);
      }) ?? [];

    const references = await pMap(
      articleIds,
      async (id: string) => {
        const result = await getArticleReference(id);
        if (result === null) {
          await repo.saveWarning(
            `Impossible de retrouver les infos de l'article ${id} référencé par le modèles ${docData.title}`
          );
        }
        return result;
      },
      { concurrency: 5 }
    );

    refs.push({
      document: {
        id: docData.initialId,
        source: SOURCES.LETTERS,
        title: docData.title,
      },
      references: references.flatMap((item) => (item !== null ? [item] : [])),
    });
  }
  return refs;
}

async function getMailTemplateReferences() {
  const letters = (await getAllDocumentsBySource([
    SOURCES.LETTERS,
  ])) as MailTemplateSubset[];
  const documentReferences = await extractMailTemplateRef(letters);
  return documentReferences;
}

export default memoizee(getMailTemplateReferences, { promise: true });
