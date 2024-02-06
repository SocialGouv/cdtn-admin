import { gqlClient } from "@shared/utils";

const getSupportedAgreements = `
query GetSupportedAgreement {
  agreements: agreement_agreements(where: {isSupported: {_eq: true}}) {
    id
    shortName
  }
}
`;

interface HasuraReturn {
  agreements: {
    id: string;
    shortName: string;
  }[];
}

export async function fetchSupportedAgreements() {
  const res = await gqlClient()
    .query<HasuraReturn>(getSupportedAgreements)
    .toPromise();
  if (res.error) {
    throw res.error;
  }
  if (!res.data || res.error) {
    throw new Error(`Impossible de récupérer les conventions collectives`);
  }
  return res.data.agreements;
}
