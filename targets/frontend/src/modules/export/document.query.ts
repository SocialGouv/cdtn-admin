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
  pause?: boolean;
};
type DocumentWIthContentType = {
  document?: { contentType?: string; idcc?: string };
};
export type UpdatedDocument = Pick<
  HasuraDocument<unknown, SourceKeys>,
  "title" | "source" | "slug" | "cdtn_id" | "initial_id" | "is_published"
> &
  DocumentWIthContentType;

export type ResultUpdatedDocument = Map<SourceKeys, readonly UpdatedDocument[]>;

export type UseDocumentsQueryResult = {
  docs: ResultUpdatedDocument;
  fetching: boolean;
};

type QueryResult = {
  documents: UpdatedDocument[];
};

function compareTitles(a: UpdatedDocument, b: UpdatedDocument): number {
  return a.title.localeCompare(b.title);
}

const EMPTY_DOCS: ResultUpdatedDocument = new Map();

export const useDocumentsQuery = ({
  date,
  pause,
}: QueryProps): UseDocumentsQueryResult => {
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
    requestPolicy: "cache-and-network",
    pause,
  });
  if (!result.data) {
    return { docs: EMPTY_DOCS, fetching: result.fetching };
  }

  const grouped = groupBy(result.data.documents, (data) => data.source);
  grouped.forEach((array, key) => {
    grouped.set(key, array.slice().sort(compareTitles));
  });
  return { docs: grouped, fetching: result.fetching };
};
