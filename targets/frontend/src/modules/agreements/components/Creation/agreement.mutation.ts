import { gql } from "@urql/core";
import { useMutation } from "urql";
import { FormDataResult } from "../Common";
import { AgreementsInsertInput } from "../graphql.type";

const insertAgreementQuery = gql`
  mutation InsertAgreement($agreement: agreements_insert_input!) {
    insert_agreements_one(object: $agreement) {
      id
    }
  }
`;

export type MutationProps = FormDataResult;

export type MutationResult = {
  id: string;
};

type MutationGraphQLProps = { agreement: AgreementsInsertInput };
type MutationGraphQLResult = { insert_agreements_one: { id: string } };

export type MutationFn = (props: MutationProps) => Promise<MutationResult>;

export const useAgreementInsertMutation = (): MutationFn => {
  const [, executeUpdate] = useMutation<
    MutationGraphQLResult,
    MutationGraphQLProps
  >(insertAgreementQuery);
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate({
      agreement: data,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (!result.data?.insert_agreements_one) {
      throw new Error("No data returned from mutation");
    }
    return result.data?.insert_agreements_one;
  };
  return resultFunction;
};
