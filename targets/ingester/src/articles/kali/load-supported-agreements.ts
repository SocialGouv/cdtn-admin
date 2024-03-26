import { gqlClient } from "@shared/utils";

export interface AgreementRecord {
  idcc: string;
  name: string;
  kali_id: string;
}

export interface AgreementResult {
  agreements: AgreementRecord[];
}

const loadSupportedAgreementsQuery = `
query LoadAgreements {
  agreements: agreement_agreements(where: {isSupported: {_eq: true}}) {
    idcc: id
    kali_id
    name
  }
}
`;

export const loadSupportedAgreements = async (): Promise<AgreementResult> => {
  const result = await gqlClient()
    .query<AgreementResult>(loadSupportedAgreementsQuery, {})
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
