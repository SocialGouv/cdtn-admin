import { OperationResult, useMutation } from "urql";

import { Answer } from "../type";

export const contributionAnswerUpdateMutation = `
mutation contributionAnswerUpdate($id: uuid!, $content: String, $otherAnswer: String, $status: statustype!, $userId: uuid!, $kali_references: [contribution_answer_kali_references_insert_input!]!, $legi_references: [contribution_answer_legi_references_insert_input!]!, $cdtn_documents: [contribution_answer_cdtn_documents_insert_input!]!) {
  update_contribution_answers_by_pk(pk_columns: {id: $id}, _set: {content: $content, other_answer: $otherAnswer}) {
    __typename
  }
  insert_contribution_answer_statuses_one(object: {status: $status, user_id: $userId, answer_id: $id}) {
    id
    created_at
  }
  delete_contribution_answer_kali_references(where: {answer_id: {_eq: $id}}) {
    affected_rows
  }
  insert_contribution_answer_kali_references(objects: $kali_references, on_conflict: {constraint: answer_kali_references_pkey}) {
    affected_rows
  }
  delete_contribution_answer_legi_references(where: {answer_id: {_eq: $id}}) {
    affected_rows
  }
  insert_contribution_answer_legi_references(objects: $legi_references, on_conflict: {constraint: answer_legi_references_pkey}) {
    affected_rows
  }
  delete_contribution_answer_cdtn_documents(where: {answer_id: {_eq: $id}}) {
    affected_rows
  }
  insert_contribution_answer_cdtn_documents(objects: $cdtn_documents, on_conflict: {constraint: answer_cdtn_documents_pkey}) {
    affected_rows
  }
}
`;

type LegiKaliReference = {
  answer_id: string;
  article_id: string;
};

type CdtnDocument = {
  answer_id: string;
  cdtn_id: string;
};

export type MutationProps = Pick<Answer, "id" | "otherAnswer" | "content"> & {
  status: string;
  userId: string;
  kali_references: LegiKaliReference[];
  legi_references: LegiKaliReference[];
  cdtn_documents: CdtnDocument[];
};

type MutationResult = (props: MutationProps) => Promise<OperationResult>;

export const useContributionAnswerUpdateMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<MutationProps>(
    contributionAnswerUpdateMutation
  );
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate(data);
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result;
  };
  return resultFunction;
};
