import { CombinedError, OperationContext, useQuery } from "urql";
import { Agreement } from "../../type";
import { gql } from "@urql/core";
import { format, parseISO } from "date-fns";

export const getAgreementQuery = gql`
  query getAgreement($id: bpchar = "") {
    agreement: agreements_by_pk(id: $id) {
      id
      isSupported
      kali_id
      legifranceUrl
      name
      rootText
      shortName
      workerNumber
    }
  }
`;

export type AgreementResult = Pick<
  Agreement,
  | "id"
  | "isSupported"
  | "kali_id"
  | "legifranceUrl"
  | "name"
  | "rootText"
  | "shortName"
  | "workerNumber"
  | "updatedAt"
>;

export type QueryResult = {
  agreement: AgreementResult;
};

export type GetAgreementProps = {
  id: string;
};

export type GetAgreementResult = {
  data?: AgreementResult;
  error?: CombinedError;
  fetching: boolean;
  reexecuteQuery: (opts?: Partial<OperationContext> | undefined) => void;
};

export const useAgreementQuery = ({
  id,
}: GetAgreementProps): GetAgreementResult => {
  const [{ data, error, fetching }, reexecuteQuery] = useQuery<QueryResult>({
    query: getAgreementQuery,
    requestPolicy: "cache-and-network",
    variables: {
      id,
    },
  });
  const agreement = data?.agreement;
  const updatedAt = agreement?.updatedAt
    ? format(parseISO(agreement.updatedAt), "dd/MM/yyyy")
    : "";
  return {
    data: agreement
      ? {
          ...agreement,
          updatedAt,
        }
      : undefined,
    error,
    fetching,
    reexecuteQuery,
  };
};
