import { useQuery } from "urql";
import { gql } from "@urql/core";
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
        id: { _ilike: $idcc }
        name: { _ilike: $keyword }
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
  idcc?: string;
  keyword?: string;
  isSupported: boolean;
};

export type AgreementsListQueryResult = {
  rows: AgreementResult[];
};

export const useListAgreementQuery = ({
  idcc,
  keyword,
  isSupported,
}: AgreementListQueryProps): AgreementsListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: listAgreementsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      idcc: idcc?.length ?? 0 > 0 ? `%${idcc}%` : "%",
      keyword: keyword?.length ?? 0 > 0 ? `%${keyword}%` : "%",
      isSupported: isSupported ? [true] : [true, false],
    },
  });
  return {
    rows: result.data?.agreements ?? [],
  };
};
