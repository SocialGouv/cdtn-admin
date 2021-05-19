import { client } from "@shared/graphql-client";
import type { SourceValues } from "@socialgouv/cdtn-sources";

import { batchPromises } from "../batchPromises";
import type {
  AllDocumentsBySourceResult,
  CountDocumentsBySourceResult,
  HasuraDocumentForAlert,
} from "./getDocumentQuery.gql";
import {
  countDocumentsBySourceQuery,
  getAllDocumentsBySourceQuery,
} from "./getDocumentQuery.gql";

const LIMIT = 30;

export async function getAllDocumentsBySource(
  source: SourceValues
): Promise<HasuraDocumentForAlert[]> {
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

  const pages = Array.from({ length: Math.ceil(count / LIMIT) }, (_, i) => i);
  const documentResults = await batchPromises(
    pages,
    async (page) =>
      client
        .query<AllDocumentsBySourceResult>(getAllDocumentsBySourceQuery, {
          limit: LIMIT,
          offset: page * LIMIT,
          source,
        })
        .toPromise(),
    10
  );
  const documents = documentResults.flatMap((result) =>
    result.status === "fulfilled" ? result.value.data?.documents ?? [] : []
  );
  return documents;
}
