import {
  createGetArticleReference,
  extractArticleId,
  gqlClient
} from "@shared/utils";
import type {
  DocumentReferences,
  InfographicTemplate
} from "@socialgouv/cdtn-types";
import { SOURCES } from "@socialgouv/cdtn-utils";
import { DilaApiClient } from "@socialgouv/dila-api-client";
import memoizee from "memoizee";
import pMap from "p-map";

import { getAllDocumentsBySource } from "../../shared/getAllDocumentsBySource";
import { WarningRepository } from "../../../repositories/WarningRepository";

export type InfographicTemplateSubset = Pick<
  InfographicTemplate,
  "document" | "source" | "title" | "slug"
> & {
  initialId: string;
  cdtnId: string;
};

const getArticleReference = createGetArticleReference(new DilaApiClient());

export async function extractInfographicRef(
  infographicTemplates: InfographicTemplateSubset[]
): Promise<DocumentReferences[]> {
  const repo = new WarningRepository(gqlClient());
  const refs: DocumentReferences[] = [];

  for (const docData of infographicTemplates) {
    const articleIds =
      docData.document.references.flatMap((ref) => {
        return extractArticleId(ref.url);
      }) ?? [];

    const references = await pMap(
      articleIds,
      async (id: string) => {
        const result = await getArticleReference(id);
        if (result === null) {
          await repo.saveWarning({
            article: id,
            document: docData.title,
            source: docData.source
          });
        }
        return result;
      },
      { concurrency: 5 }
    );

    refs.push({
      document: {
        id: docData.initialId,
        source: SOURCES.INFOGRAPHICS,
        title: docData.title,
        slug: docData.slug
      },
      references: references.flatMap((item) => (item !== null ? [item] : []))
    });
  }
  return refs;
}

async function getInfographicReferences() {
  const letters = (await getAllDocumentsBySource([
    SOURCES.INFOGRAPHICS
  ])) as InfographicTemplateSubset[];
  const documentReferences = await extractInfographicRef(letters);
  return documentReferences;
}

export default memoizee(getInfographicReferences, { promise: true });
