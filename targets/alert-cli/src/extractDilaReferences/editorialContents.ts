import {
  createGetArticleReference,
  extractArticleId,
} from "@shared/dila-resolver";
import type {
  DocumentReferences,
  EditoralContentReferenceBloc,
  EditorialContent,
} from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { DilaApiClient } from "@socialgouv/dila-api-client";
import memoizee from "memoizee";
import pMap from "p-map";

import { getAllDocumentsBySource } from "./getAllDocumentsBySource";

export type EditorialContentSubset = Pick<
  EditorialContent,
  "document" | "source" | "title"
> & {
  initialId: string;
  cdtnId: string;
};

const getArticleReference = createGetArticleReference(new DilaApiClient());

export async function extractEditorialContentTemplateRef(
  editorialContent: EditorialContentSubset[]
): Promise<DocumentReferences[]> {
  const refs: DocumentReferences[] = [];

  for (const docData of editorialContent) {
    const extractedArticleIds: string[] =
      docData.document.contents.flatMap<string>((part): string[] => {
        return part.references.flatMap<string>(({ links }): string[] => {
          return links.flatMap(({ url }): string[] => {
            return extractArticleId(url as string);
          });
        });
      });
    const articleIds: string[] = (docData.document.references ?? [])
      .flatMap((bloc: EditoralContentReferenceBloc) =>
        bloc.links.flatMap((link) => extractArticleId(link.url))
      )
      .concat(extractedArticleIds);
    const references = await pMap(
      articleIds,
      async (id: string) => getArticleReference(id),
      { concurrency: 5 }
    );

    refs.push({
      document: {
        id: docData.initialId,
        source: SOURCES.EDITORIAL_CONTENT,
        title: docData.title,
      },
      references: references.flatMap((item) => (item !== null ? [item] : [])),
    });
  }
  return refs;
}

async function getEditorialContentTemplateReferences() {
  const letters = (await getAllDocumentsBySource([
    SOURCES.EDITORIAL_CONTENT,
  ])) as EditorialContentSubset[];
  const documentReferences = await extractEditorialContentTemplateRef(letters);
  return documentReferences;
}

export default memoizee(getEditorialContentTemplateReferences, {
  promise: true,
});
