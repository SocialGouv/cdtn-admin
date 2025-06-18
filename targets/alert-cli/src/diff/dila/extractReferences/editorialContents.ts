import {
  createGetArticleReference,
  extractArticleId,
  gqlClient,
} from "@shared/utils";
import type {
  DocumentReferences,
  EditoralContentReferenceBloc,
  EditorialContent,
} from "@socialgouv/cdtn-types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { DilaApiClient } from "@socialgouv/dila-api-client";
import memoizee from "memoizee";
import pMap from "p-map";

import { getAllDocumentsBySource } from "../../shared/getAllDocumentsBySource";
import { WarningRepository } from "../../../repositories/WarningRepository";

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
  const repo = new WarningRepository(gqlClient());
  const refs: DocumentReferences[] = [];

  for (const docData of editorialContent) {
    const extractedArticleIds: string[] =
      docData.document.contents.flatMap<string>((part): string[] => {
        return (part.references ?? []).flatMap<string>(
          ({ links }): string[] => {
            return links.flatMap(({ url }): string[] => {
              return extractArticleId(url);
            });
          }
        );
      });
    const articleIds: string[] = (docData.document.references ?? [])
      .flatMap((bloc: EditoralContentReferenceBloc) =>
        bloc.links.flatMap((link) => extractArticleId(link.url))
      )
      .concat(extractedArticleIds);
    const references = await pMap(
      articleIds,
      async (id: string) => {
        const result = await getArticleReference(id);
        if (result === null) {
          await repo.saveWarning({
            article: id,
            document: docData.title,
            source: docData.source,
          });
        }
        return result;
      },
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
  return extractEditorialContentTemplateRef(letters);
}

export default memoizee(getEditorialContentTemplateReferences, {
  promise: true,
});
