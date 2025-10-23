import { useQuery } from "urql";
import { SourceKeys, SOURCES } from "@socialgouv/cdtn-utils";
import { HasuraDocument } from "@socialgouv/cdtn-types";
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
        document
      }
}`;

type QueryProps = {
  date: Date;
};
type DocumentWIthContentType = {
  document?: { contentType?: string; idcc?: string };
};
export type UpdatedDocument = Pick<
  HasuraDocument<unknown>,
  "title" | "source" | "slug" | "cdtn_id" | "initial_id" | "is_published"
> &
  DocumentWIthContentType;

export type ResultUpdatedDocument = Map<
  SourceKeys,
  readonly UpdatedDocument[]
>;

type QueryResult = {
  documents: UpdatedDocument[];
};

function compareTitles(a: UpdatedDocument, b: UpdatedDocument): number {
  return a.title.localeCompare(b.title);
}

export const useDocumentsQuery = ({
  date,
}: QueryProps): ResultUpdatedDocument => {
  const [result] = useQuery<QueryResult>({
    query: getDocumentsUpdatedAfterDateQuery,
    variables: {
      updated_at: date,
      sources: [
        SOURCES.LETTERS,
        SOURCES.EDITORIAL_CONTENT,
        SOURCES.CONTRIBUTIONS,
        SOURCES.INFOGRAPHICS,
      ],
    },
    requestPolicy: "network-only",
  });
  if (!result.data) {
    return new Map();
  }

  const grouped = groupBy(result.data.documents, (data) => data.source);
  grouped.forEach((array, key) => {
    grouped.set(key, array.slice().sort(compareTitles));
  });
  return grouped;
};
