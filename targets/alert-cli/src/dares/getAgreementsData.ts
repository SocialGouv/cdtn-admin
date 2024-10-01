import { gqlClient } from "@shared/utils";

const getAgreementQuery = `
query queryAgreements {
  agreements: agreement_agreements(
  where: { id : { _neq: "0000" }},
  order_by: { id: asc }) {
    id
    name
  }
}
`;

export interface GetAgreementData {
  num: number;
  name: string;
}

interface GetAgreementQueryResult {
  agreements: {
    id: string;
    name: string;
  }[];
}

export async function getAgreements(): Promise<GetAgreementData[] | undefined> {
  const client = gqlClient();
  const result = await client
    .query<GetAgreementQueryResult>(getAgreementQuery, {})
    .toPromise();
  return result.data?.agreements?.map(({ name, id }) => {
    return { name, num: parseInt(id) };
  });
}
