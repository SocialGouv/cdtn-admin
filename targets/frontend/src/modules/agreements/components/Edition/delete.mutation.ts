import { gql, useMutation } from "@urql/next";

const deleteAgreementQuery = gql`
  mutation DeleteAgreement($id: bpchar!, $initialId: String!) {
    delete_agreement_agreements_by_pk(id: $id) {
      id
    }
    delete_documents(where: { initial_id: { _eq: $initialId } }) {
      affected_rows
    }
  }
`;

export type MutationProps = {
  id: string;
};

export type MutationResult = string;

type MutationGraphQLProps = {
  id: string;
  initialId: string;
};

type MutationGraphQLResult = {
  delete_agreement_agreements_by_pk: {
    id: string;
  } | null;
  delete_documents: {
    affected_rows: number;
  };
};

export type MutationFn = (props: MutationProps) => Promise<MutationResult>;

export const useAgreementDeleteMutation = (): MutationFn => {
  const [, executeUpdate] = useMutation<
    MutationGraphQLResult,
    MutationGraphQLProps
  >(deleteAgreementQuery);
  const resultFunction = async ({ id }: MutationProps) => {
    const result = await executeUpdate({
      id,
      initialId: id,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (!result.data?.delete_agreement_agreements_by_pk) {
      throw new Error(`No agreement to delete for id ${id}`);
    }
    return result.data.delete_agreement_agreements_by_pk.id;
  };
  return resultFunction;
};
