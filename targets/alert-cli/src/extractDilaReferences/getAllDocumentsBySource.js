import { client } from "@shared/graphql-client";

import { batchPromises } from "../batchPromises";
import {
  countDocumentsBySourceQuery,
  getAllDocumentsBySourceQuery,
} from "./getDocumentQuery.gql";

const LIMIT = 30;

/**
 *
 * @param {import("@socialgouv/cdtn-sources").SourceValues} source
 */
export async function getAllDocumentsBySource(source) {
  const result = await client
    .query(countDocumentsBySourceQuery, { source })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    throw new Error("getSources");
  }
  const { count } = result.data.documents_aggregate.aggregate;

  const pages = Array.from({ length: Math.ceil(count / LIMIT) }, (_, i) => i);
  const documentResults = await batchPromises(
    pages,
    (page) =>
      client
        .query(getAllDocumentsBySourceQuery, {
          limit: LIMIT,
          offset: page * LIMIT,
          source,
        })
        .toPromise(),
    10
  );
  const documents = documentResults.flatMap((result) =>
    result.status === "fulfilled" ? result.value.data.documents : []
  );
  return documents;
}
