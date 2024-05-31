import { gqlClient } from "@shared/utils";

const updateDocumentWithCdtnId = `
mutation editDocument($cdtnId: String!, $document: jsonb) {
  update_documents(where: {cdtn_id: {_eq: $cdtnId}}, _set: {document: $document}) {
    affected_rows
  }
}
`;

export async function updateDocument(
  cdtnId: string,
  document: any
): Promise<void> {
  const res = await gqlClient()
    .mutation(updateDocumentWithCdtnId, {
      cdtnId,
      document,
    })
    .toPromise();
  if (res.error) {
    console.error(res.error);
    throw res.error;
  }
  return;
}
