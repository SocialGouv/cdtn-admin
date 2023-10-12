import { Document } from "../type";
import { ApiClient } from "src/lib/api";

const query = `query documents($source: String!, $initialId: String) {
  documents(
      where: {
        source: { _eq: $source },
        initial_id: { _eq: $initialId }
      }
    ) {
        cdtn_id
        initial_id
        source
        document
        slug
        text
        title
        meta_description
  }
}`;

export type QueryDocument = Document;

export type QueryDocumentResult = {
  documents: QueryDocument[];
};

export type DocumentsQueryProps = {
  source: string;
  initialId?: string;
};

export const queryDocument = async (
  client: ApiClient,
  variables: DocumentsQueryProps
): Promise<Document | undefined> => {
  console.log("queryDocument", query, variables);
  const { data: result, error } = await client.query<QueryDocumentResult>(
    query,
    variables
  );
  if (error) {
    console.log(error);
    throw error;
  }
  console.log("result", result);
  const data = result?.documents[0];

  return data;
};

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
        cdtnId: cdtn_id
        isPublished: is_published
      }
}`;
