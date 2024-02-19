import { useQuery } from "urql";
import { SourceRoute, SOURCES } from "@socialgouv/cdtn-sources";
import { Document } from "@shared/types";
import { groupBy } from "graphql/jsutils/groupBy";

export const getDocumentsUpdatedAfterDateQuery = `
query GetDocuments($updated_at: timestamptz!, $sources: [String!]) {
  documents(where: {
        updated_at: {_gte: $updated_at},
        source: {_in: $sources}
      },
      order_by: {updated_at: desc}) {
        title
        source
        slug
        cdtn_id
        initial_id
        is_published
      }
}`;

type QueryProps = {
  date: Date;
};

export type UpdatedDocument = Pick<
  Document<unknown>,
  "title" | "source" | "slug" | "cdtn_id" | "initial_id" | "is_published"
>;

export type ResultUpdatedDocument = Map<
  SourceRoute,
  readonly UpdatedDocument[]
>;

type QueryResult = {
  documents: UpdatedDocument[];
};

export const useDocumentsQuery = ({
  date,
}: QueryProps): ResultUpdatedDocument => {
  const [result] = useQuery<QueryResult>({
    query: getDocumentsUpdatedAfterDateQuery,
    variables: {
      updated_at: date,
      sources: [SOURCES.LETTERS, SOURCES.EDITORIAL_CONTENT],
    },
    requestPolicy: "network-only",
  });
  if (!result.data) {
    return new Map();
  }
  return groupBy(result.data.documents, (data) => data.source);
};
