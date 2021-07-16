import type { OperationResult } from "@shared/graphql-client";
import { client } from "@shared/graphql-client";
import type { SourceValues } from "@socialgouv/cdtn-sources";
import memoizee from "memoizee";

import { batchPromises } from "../batchPromises";
import type {
  AllDocumentsBySourceResult,
  AllDocumentsWithRelationBySourceResult,
  CountDocumentsBySourceResult,
  HasuraDocumentForAlert,
  HasuraDocumentWithRelations,
} from "./getDocumentQuery.gql";
import {
  countDocumentsBySourceQuery,
  getAllDocumentsBySourceQuery,
  getAllDocumentsWithRelationsBySourceQuery,
} from "./getDocumentQuery.gql";

const PAGE_SIZE = 100;
const JOB_CONCURENCY = 3;

const createDocumentsFetcher =
  <
    T extends
      | AllDocumentsBySourceResult
      | AllDocumentsWithRelationBySourceResult
  >(
    gqlRequest = getAllDocumentsBySourceQuery
  ) =>
  async (
    source: SourceValues
  ): Promise<PromiseSettledResult<OperationResult<T>>[]> => {
    const countResult = await client
      .query<CountDocumentsBySourceResult>(countDocumentsBySourceQuery, {
        source,
      })
      .toPromise();

    if (countResult.error || !countResult.data) {
      console.error(countResult.error && "no data received");
      throw new Error("getSources");
    }

    const { count } = countResult.data.documents_aggregate.aggregate;

    const pages = Array.from(
      { length: Math.ceil(count / PAGE_SIZE) },
      (_, i) => i
    );
    const documentResults = await batchPromises(
      pages,
      async (page) =>
        client
          .query<T>(gqlRequest, {
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
            source,
          })
          .toPromise(),
      JOB_CONCURENCY
    );
    return documentResults;
  };

export async function _getDocumentsBySource(
  source: SourceValues
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
  source: SourceValues
): Promise<HasuraDocumentWithRelations[]> {
  const fetchDocuments =
    createDocumentsFetcher<AllDocumentsWithRelationBySourceResult>(
      getAllDocumentsWithRelationsBySourceQuery
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

export const getDocumentsWithRelationsBySource = memoizee(
  _getDocumentsWithRelationsBySource
);
