import { useQuery } from "urql";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { ShortDocument } from "@shared/types";

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
        isPublished: is_published
      }
}`;

type QueryProps = {
  date: Date;
};

type QueryResult = {
  documents: ShortDocument<any>[];
};

export const useDocumentsQuery = ({
  date,
}: QueryProps): ShortDocument<any>[] => {
  const [result] = useQuery<QueryResult>({
    query: getDocumentsUpdatedAfterDateQuery,
    variables: {
      updated_at: date,
      sources: [
        SOURCES.LETTERS,
        SOURCES.EDITORIAL_CONTENT,
        SOURCES.CONTRIBUTIONS,
      ],
    },
  });
  if (!result.data) {
    return [];
  }
  return result.data.documents;
};
