import { gqlClient } from "@shared/utils";

const getAgreementsWithKaliId = `
query GetAgreementsWithKaliId {
  agreements: agreement_agreements(where: {kali_id: {_is_null: false}}) {
    id
    kaliId: kali_id
    shortName
    rootText
  }
}
`;

export interface ShortAgreement {
  id: string;
  kaliId: string;
  shortName: string;
  rootText?: string;
}

interface HasuraReturn {
  agreements: ShortAgreement[];
}

export async function fetchAgreementsWithKaliId() {
  const res = await gqlClient()
    .query<HasuraReturn>(getAgreementsWithKaliId)
    .toPromise();
  if (res.error) {
    throw res.error;
  }
  if (!res.data || res.error) {
    throw new Error(`Impossible de récupérer les conventions collectives`);
  }
  return res.data.agreements;
}
