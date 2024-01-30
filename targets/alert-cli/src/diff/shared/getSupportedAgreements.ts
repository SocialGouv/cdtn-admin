import { gqlClient } from "@shared/utils";
import { PublicAgreement } from "../../types";

const fetchSupportedAgreements = `
query getSupportedAgreements {
  agreements(where: {isSupported: {_eq: true}}) {
    id
    kali_id
  }
}
`;

interface HasuraReturn {
  agreements: PublicAgreement[];
}

export async function getSupportedAgreements(): Promise<PublicAgreement[]> {
  const res = await gqlClient()
    .query<HasuraReturn>(fetchSupportedAgreements)
    .toPromise();
  if (res.error || !res.data) {
    throw new Error(
      "Erreur lors de la requête pour récupérer les conventions collectives sur la db"
    );
  }
  return res.data.agreements;
}
