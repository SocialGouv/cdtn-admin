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

export async function getAgreements(): Promise<GetAgreementData[]> {
  const client = gqlClient();
  const result = await client
    .query<GetAgreementQueryResult>(getAgreementQuery, {})
    .toPromise();
  if (
    !result ||
    !result.data ||
    !result.data?.agreements ||
    !result.data?.agreements.length
  ) {
    throw new Error("An error occured on hasura agreement loading");
  }
  return result.data.agreements.map(({ name, id }) => {
    return { name, num: parseInt(id) };
  });
}
