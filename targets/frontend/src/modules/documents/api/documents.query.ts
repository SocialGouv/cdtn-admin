import { Document } from "@shared/types";
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
        is_available
  }
}`;

export type QueryDocument = Document<any>;

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
): Promise<Document<any> | undefined> => {
  const { data: result, error } = await client.query<QueryDocumentResult>(
    query,
    variables
  );
  if (error) {
    console.log(error);
    throw error;
  }
  const data = result?.documents[0];

  return data;
};
