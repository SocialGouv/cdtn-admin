import { gqlClient } from "@shared/utils";

const updateDoc = `
mutation update_documents($slug: String!) {
  documents: update_documents(_set: {is_available: true}, where: {slug: {_eq: $slug}}) {
    affected_rows
  }
}
`;

export async function updateDocumentAvailabilityToTrue(
  slug: string
): Promise<void> {
  const res = await gqlClient()
    .mutation(updateDoc, {
      slug,
    })
    .toPromise();
  if (res.error) {
    throw res.error;
  }
}
