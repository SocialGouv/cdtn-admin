import { gqlClient } from "@shared/utils";

const fetchContribs = `
  query fetch_contribs() {
    documents(
      where: {
        source: { _eq: "contributions" }
      }
    ) {
      slug
    }
  }
`;

interface HasuraReturn {
  documents: {
    slug: string;
    document: any;
  }[];
}

export async function fetchDocumentContributions() {
  const res = await gqlClient().query<HasuraReturn>(fetchContribs).toPromise();
  if (res.error) {
    throw res.error;
  }
  if (!res.data || res.error) {
    throw new Error(
      `Impossible de récupérer les contributions de la table documents`
    );
  }
  return res.data.documents;
}
