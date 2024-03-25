import { SourceValues } from "@socialgouv/cdtn-sources";
import {
  AllDocumentsBySourceResult,
  AllDocumentsWithRelationBySourceResult,
  CountDocumentsBySourceResult,
  countDocumentsBySourceQuery,
  getAllDocumentsBySourceQuery,
} from "./getDocumentQuery.gql";
import { gqlClient } from "@shared/utils";
import { batchPromises } from "../../utils/batch-promises";

const PAGE_SIZE = 100;
const JOB_CONCURENCY = 3;

export const createDocumentsFetcher =
  <
    T extends
      | AllDocumentsBySourceResult
      | AllDocumentsWithRelationBySourceResult
  >(
    gqlRequest = getAllDocumentsBySourceQuery
  ) =>
  async (source: SourceValues[]) => {
    const countResult = await gqlClient()
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
        gqlClient()
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
