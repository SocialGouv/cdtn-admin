import { gql, useQuery } from "urql";
import { Agreement } from "../../type";

export const listAgreementsQuery = gql`
  query ListAgreements(
    $idcc: bpchar
    $keyword: String
    $isSupported: [Boolean!]
  ) {
    agreements: agreement_agreements(
      order_by: { id: asc }
      where: {
        _or: [{ id: { _ilike: $idcc } }, { shortName: { _ilike: $keyword } }]
        _and: { id: { _neq: "0000" } }
        isSupported: { _in: $isSupported }
      }
    ) {
      id
      isSupported
      shortName
    }
  }
`;

export type AgreementResult = Pick<
  Agreement,
  "id" | "isSupported" | "shortName"
>;

export type QueryResult = {
  agreements: AgreementResult[];
};

export type AgreementListQueryProps = {
  keyword?: string;
  isSupported: boolean[];
};

export type AgreementsListQueryResult = {
  rows: AgreementResult[];
};

export const useListAgreementQuery = ({
  keyword,
  isSupported,
}: AgreementListQueryProps): AgreementsListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: listAgreementsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      idcc: (keyword?.length ?? 0 > 0) ? `%${keyword}%` : "%",
      keyword: (keyword?.length ?? 0 > 0) ? `%${keyword}%` : "%",
      isSupported: isSupported,
    },
  });
  return {
    rows: result.data?.agreements ?? [],
  };
};
