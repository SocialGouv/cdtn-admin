import { gqlClient, logger } from "@shared/utils";
import { SourceRoute } from "@socialgouv/cdtn-sources";
import { HasuraDocument } from "@socialgouv/cdtn-types";

const fetchDocumentQuery = `
query fetchDocument() {
  documents(where: {source: {_eq: $source}}) {
    cdtn_id
    document
  }
}
`;

interface HasuraReturn {
  documents: Pick<HasuraDocument<any>, "cdtn_id" | "document">[];
}

export interface Document {
  cdtnId: string;
  document: any;
}

export async function fetchDocumentBySource(
  source: SourceRoute
): Promise<HasuraReturn["documents"]> {
  const res = await gqlClient()
    .query<HasuraReturn>(fetchDocumentQuery, { source })
    .toPromise();
  if (res.error) {
    throw res.error;
  }
  if (!res.data?.documents.length) {
    logger.error("No contributions found");
    return [];
  }
  return res.data.documents;
}
