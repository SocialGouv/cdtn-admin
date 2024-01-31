import { gql } from "@urql/core";
import { useMutation } from "urql";
import { FormDataResult } from "../Common";
import { AgreementsInsertInput } from "../graphql.type";

const updateAgreementQuery = gql`
  mutation UpdateAgreement($id: bpchar!, $agreement: agreements_set_input) {
    update_agreements_by_pk(pk_columns: { id: $id }, _set: $agreement) {
      id
    }
  }
`;

export type MutationProps = FormDataResult;

export type MutationResult = {
  id: string;
};

type MutationGraphQLProps = {
  id: string;
  agreement: AgreementsInsertInput;
};

type MutationGraphQLResult = { update_agreements_by_pk: { id: string } };

export type MutationFn = (props: MutationProps) => Promise<MutationResult>;

export const useAgreementUpdateMutation = (): MutationFn => {
  const [, executeUpdate] = useMutation<
    MutationGraphQLResult,
    MutationGraphQLProps
  >(updateAgreementQuery);
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate({
      id: data.id,
      agreement: data,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (!result.data?.update_agreements_by_pk) {
      throw new Error("No data returned from mutation");
    }
    return result.data?.update_agreements_by_pk;
  };
  return resultFunction;
};
