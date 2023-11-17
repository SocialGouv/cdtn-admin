import { fetchKaliReferencesInput } from "./recentKaliReferences";
import { KaliArticle } from "../../components/contributions";
import { gqlClient } from "@shared/utils";

const getKaliReferences = `
query getKaliReferences($agreementId: bpchar!, $query: String!) {
  kali_articles(where: {agreement_id: {_eq: $agreementId}, _or: [{path: {_ilike: $query}}, {id: {_ilike: $query}}]}) {
    path
    label
    id
    cid
    agreementId: agreement_id
    createdAt: created_at
  }
}
`;

export async function fetchKaliReferences({
  agreementId,
  query,
}: Omit<fetchKaliReferencesInput, "limit">) {
  const result = await gqlClient()
    .query<{ kali_articles: KaliArticle[] }>(getKaliReferences, {
      agreementId,
      query,
    })
    .toPromise();
  if (result.error) {
    console.error("[fetchKaliReferences]", result.error);
    throw result.error;
  }
  return result?.data?.kali_articles;
}
