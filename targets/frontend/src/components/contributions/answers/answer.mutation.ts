import { OperationResult, useMutation } from "urql";

import { Answer } from "../type";

import {
  formatCdtnReferences,
  formatKaliReferences,
  formatLegiReferences,
  formatOtherReferences,
} from "./answerReferences";
import { gql } from "@urql/core";

export const contributionAnswerUpdateMutation = gql`
  mutation contributionAnswerUpdate(
    $id: uuid!
    $content: String
    $otherAnswer: String
    $status: statustype!
    $kaliReferences: [contribution_answer_kali_references_insert_input!]!
    $legiReferences: [contribution_answer_legi_references_insert_input!]!
    $otherReferences: [contribution_answer_other_references_insert_input!]!
    $cdtnReferences: [contribution_answer_cdtn_references_insert_input!]!
  ) {
    update_contribution_answers_by_pk(
      pk_columns: { id: $id }
      _set: { content: $content, other_answer: $otherAnswer }
    ) {
      __typename
    }
    insert_contribution_answer_statuses_one(
      object: { status: $status, answer_id: $id }
    ) {
      id
      created_at
    }
    delete_contribution_answer_kali_references(
      where: { answer_id: { _eq: $id } }
    ) {
      affected_rows
    }
    insert_contribution_answer_kali_references(
      objects: $kaliReferences
      on_conflict: { constraint: answer_kali_references_pkey }
    ) {
      affected_rows
    }
    delete_contribution_answer_legi_references(
      where: { answer_id: { _eq: $id } }
    ) {
      affected_rows
    }
    insert_contribution_answer_legi_references(
      objects: $legiReferences
      on_conflict: { constraint: answer_legi_references_pkey }
    ) {
      affected_rows
    }
    delete_contribution_answer_cdtn_references(
      where: { answer_id: { _eq: $id } }
    ) {
      affected_rows
    }
    insert_contribution_answer_cdtn_references(
      objects: $cdtnReferences
      on_conflict: { constraint: answer_cdtn_references_pkey }
    ) {
      affected_rows
    }
    delete_contribution_answer_other_references(
      where: { answer_id: { _eq: $id } }
    ) {
      affected_rows
    }
    insert_contribution_answer_other_references(
      objects: $otherReferences
      on_conflict: { constraint: answer_other_references_pkey }
    ) {
      affected_rows
    }
  }
`;

export const contributionAnswerPublishMutation = gql`
  mutation updateAnswerStatus($id: String!) {
    publish_contribution_answer(answerId: $id) {
      cdtnId
    }
  }
`;

export type MutationProps = Pick<
  Answer,
  | "id"
  | "otherAnswer"
  | "content"
  | "kaliReferences"
  | "legiReferences"
  | "otherReferences"
  | "cdtnReferences"
> & {
  status: string;
};

type MutationResult = (props: MutationProps) => Promise<OperationResult>;

type PublishMutationResult = (id: string) => Promise<OperationResult>;

export const useContributionAnswerUpdateMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<MutationProps>(
    contributionAnswerUpdateMutation
  );
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate({
      ...data,
      kaliReferences: formatKaliReferences(data.id, data.kaliReferences),
      legiReferences: formatLegiReferences(data.id, data.legiReferences),
      cdtnReferences: formatCdtnReferences(data.id, data.cdtnReferences),
      otherReferences: formatOtherReferences(data.id, data.otherReferences),
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result;
  };
  return resultFunction;
};

export const useContributionAnswerPublishMutation =
  (): PublishMutationResult => {
    const [, executeUpdate] = useMutation<void>(
      contributionAnswerPublishMutation
    );
    const resultFunction = async (id: string) => {
      const result = await executeUpdate({
        id,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    };
    return resultFunction;
  };
