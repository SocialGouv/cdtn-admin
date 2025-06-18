import { HasuraDocument } from "@socialgouv/cdtn-types";
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
        is_searchable
  }
}`;

const fetchDocumentBySlug = `
  query get_contrib_by_slug($slug: String!, $source: String!) {
    documents(
      where: {
        source: { _eq: $source },
        slug: {_eq: $slug}
      }
    ) {
      document
    }
  }
`;

export type QueryDocument = HasuraDocument<any>;

export type QueryDocumentResult = {
  documents: QueryDocument[];
};

export type DocumentsQueryProps = {
  source: string;
  initialId?: string;
};

export type DocumentsQueryBySlugProps = {
  source: string;
  slug: string;
};

export const queryDocument = async (
  client: ApiClient,
  variables: DocumentsQueryProps
): Promise<HasuraDocument<any> | undefined> => {
  const { data: result, error } = await client.query<QueryDocumentResult>(
    query,
    variables
  );
  if (error) {
    console.log(error);
    throw error;
  }
  return result?.documents[0];
};

export const queryDocumentBySlug = async (
  client: ApiClient,
  variables: DocumentsQueryBySlugProps
): Promise<HasuraDocument<any> | undefined> => {
  const { data: result, error } = await client.query<QueryDocumentResult>(
    fetchDocumentBySlug,
    variables
  );
  if (error) {
    console.log(error);
    throw error;
  }
  return result?.documents[0];
};
