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
        document {
          contentType @include(if: $includeContentType)
        }
      }
}`;

type QueryProps = {
  date: Date;
};

type DocumentWIthContentType = { document: { contentType?: string } };
type QueryResult = {
  documents: (ShortDocument<any> & DocumentWIthContentType)[];
};

export const useDocumentsQuery = ({
  date,
}: QueryProps): (ShortDocument<any> & DocumentWIthContentType)[] => {
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
console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< result.data.documents")
console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< result.data.documents")
console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< result.data.documents")
console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< result.data.documents")
console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< result.data.documents")
console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< result.data.documents")

console.log(result.data.documents)
  // Temporaire tant que l'ancien outil de contrib est la : exclure les anciennes contribs qui ont une updated date toujours mise à jour
  return result.data.documents
  // return result.data.documents.filter(
  //   (doc) => doc.source !== SOURCES.CONTRIBUTIONS || doc.document?.contentType
  // );
};
