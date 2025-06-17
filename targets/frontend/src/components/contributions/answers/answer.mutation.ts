import { OperationResult, useMutation } from "urql";

import { Answer } from "../type";

import {
  formatCdtnReferences,
  formatKaliReferences,
  formatLegiReferences,
  formatOtherReferences,
} from "./answerReferences";

export const contributionAnswerUpdateMutation = `
mutation contributionAnswerUpdate($id: uuid!, $displayDate: date, $content: String, $description: String, $contentType: String, $status: statustype!, $userId: uuid!, $contentServicePublicCdtnId: String, $messageIntroNoCDT: String, $messageBlockGenericNoCDT: String, $kaliReferences: [contribution_answer_kali_references_insert_input!]!, $legiReferences: [contribution_answer_legi_references_insert_input!]!, $otherReferences: [contribution_answer_other_references_insert_input!]!, $cdtnReferences: [contribution_answer_cdtn_references_insert_input!]!) {
  update_contribution_answers_by_pk(pk_columns: {id: $id}, _set: {display_date: $displayDate, content: $content, description: $description, content_type: $contentType, content_service_public_cdtn_id: $contentServicePublicCdtnId, message_block_generic_no_CDT: $messageBlockGenericNoCDT}) {
    __typename
  }
  insert_contribution_answer_statuses_one(object: {status: $status, user_id: $userId, answer_id: $id}) {
    id
    created_at
  }
  delete_contribution_answer_kali_references(where: {answer_id: {_eq: $id}}) {
    affected_rows
  }
  insert_contribution_answer_kali_references(objects: $kaliReferences, on_conflict: {constraint: answer_kali_references_pkey}) {
    affected_rows
  }
  delete_contribution_answer_legi_references(where: {answer_id: {_eq: $id}}) {
    affected_rows
  }
  insert_contribution_answer_legi_references(objects: $legiReferences, on_conflict: {constraint: answer_legi_references_pkey}) {
    affected_rows
  }
  delete_contribution_answer_cdtn_references(where: {answer_id: {_eq: $id}}) {
    affected_rows
  }
  insert_contribution_answer_cdtn_references(objects: $cdtnReferences, on_conflict: {constraint: answer_cdtn_references_pkey}) {
    affected_rows
  }
  delete_contribution_answer_other_references(where: {answer_id: {_eq: $id}}) {
    affected_rows
  }
  insert_contribution_answer_other_references(objects: $otherReferences, on_conflict: {constraint: answer_other_references_pkey}) {
    affected_rows
  }
}
`;

export type MutationProps = Pick<
  Answer,
  | "id"
  | "contentType"
  | "description"
  | "contentServicePublicCdtnId"
  | "messageBlockGenericNoCDT"
  | "content"
  | "kaliReferences"
  | "legiReferences"
  | "otherReferences"
  | "cdtnReferences"
  | "displayDate"
> & {
  status: string;
  userId: string;
};

type MutationResult = (props: MutationProps) => Promise<OperationResult>;

export const useContributionAnswerUpdateMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<MutationProps>(
    contributionAnswerUpdateMutation
  );
  return async (data: MutationProps) => {
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
};
