import { client } from "@shared/graphql-client";

export interface AgreementRecord {
  idcc: string;
  name: string;
  kali_id: string;
}

export interface AgreementResult {
  agreements: AgreementRecord[];
}

const loadAgreementsQuery = `
query LoadAgreements {
  agreements(where: {id: {_neq: "0000"}}) {
    idcc: id
    kali_id
    name
  }
}
`;

export const loadAgreements = async (): Promise<AgreementResult> => {
  const result = await client
    .query<AgreementResult>(loadAgreementsQuery)
    .toPromise();

  if (result.error) {
    console.error(result.error.graphQLErrors[0]);
    throw new Error(`Error quering agreements ${result.error}`);
  }
  if (!result.data || result.data.agreements.length === 0) {
    throw new Error(`Error quering agreements, no agreements found`);
  }
  return result.data;
};
