import { gqlClient } from "@shared/utils";
import { PublicAgreement } from "../../types";

const fetchAgreements = `
query getAgreements {
  agreements {
    id
    kali_id
  }
}
`;

interface HasuraReturn {
  agreements: PublicAgreement[];
}

export async function getAgreements(): Promise<PublicAgreement[]> {
  const res = await gqlClient()
    .query<HasuraReturn>(fetchAgreements)
    .toPromise();
  if (res.error || !res.data) {
    throw new Error(
      "Erreur lors de la requête pour récupérer les conventions collectives sur la db"
    );
  }
  return res.data.agreements;
}
