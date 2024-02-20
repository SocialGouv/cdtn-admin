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
        document {
          contentType @include(if: $includeContentType)
        }
      }
}`;

type QueryProps = {
  date: Date;
};
type DocumentWIthContentType = { document: { contentType?: string } };
export type UpdatedDocument = Pick<
  Document<unknown>,
  "title" | "source" | "slug" | "cdtn_id" | "initial_id" | "is_published"
>& DocumentWIthContentType;

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
      sources: [
        SOURCES.LETTERS,
        SOURCES.EDITORIAL_CONTENT,
        SOURCES.CONTRIBUTIONS,
      ],
    },
    requestPolicy: "network-only",
  });
  if (!result.data) {
    return new Map();
  }
  // Temporaire tant que l'ancien outil de contrib est la : exclure les anciennes contribs qui ont une updated date toujours mise à jour
  const filtered = result.data.documents.filter(
    (doc) => doc.source !== SOURCES.CONTRIBUTIONS || doc.document?.contentType
  );
  return groupBy(filtered, (data) => data.source);
};
