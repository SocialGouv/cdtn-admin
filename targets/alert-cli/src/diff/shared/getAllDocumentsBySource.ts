import { SOURCES, type SourceKeys } from "@socialgouv/cdtn-utils";
import memoizee from "memoizee";

import type {
  AllDocumentsBySourceResult,
  AllDocumentsWithRelationBySourceResult,
  HasuraDocumentForAlert,
  HasuraDocumentWithRelations,
} from "./getDocumentQuery.gql";
import {
  getAllDocumentsBySourceQuery,
  getAllDocumentsWithRelationsBySourceQuery,
} from "./getDocumentQuery.gql";
import { fetchPrequalified } from "./fetchPrequalified";
import { createDocumentsFetcher } from "./createDocumentsFetcher";

export async function _getDocumentsBySource(
  source: SourceKeys[]
): Promise<HasuraDocumentForAlert[]> {
  const fetchDocuments = createDocumentsFetcher<AllDocumentsBySourceResult>(
    getAllDocumentsBySourceQuery
  );
  const documentResults = await fetchDocuments(source);

  const documents = documentResults.flatMap((result) => {
    if (result.status === "fulfilled" && result.value.data) {
      return result.value.data.documents;
    }
    return [];
  });
  return documents;
}

export const getAllDocumentsBySource = memoizee(_getDocumentsBySource);

export async function _getDocumentsWithRelationsBySource(
  source: SourceKeys[]
): Promise<HasuraDocumentWithRelations[]> {
  const fetchDocuments =
    createDocumentsFetcher<AllDocumentsWithRelationBySourceResult>(
      getAllDocumentsWithRelationsBySourceQuery
    );
  const documentResults = await fetchDocuments(source);
  let documents = documentResults.flatMap((result) => {
    if (result.status === "fulfilled" && result.value.data) {
      return result.value.data.documents;
    }
    return [];
  });
  if (source.includes(SOURCES.PREQUALIFIED)) {
    const fetchedPrequalified = await fetchPrequalified();
    if (fetchedPrequalified) {
      documents = documents.concat(fetchedPrequalified);
    }
  }
  return documents;
}

export const getDocumentsWithRelationsBySource = memoizee(
  _getDocumentsWithRelationsBySource
);
