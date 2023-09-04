import { gql } from "@urql/core";
import { Status } from "../../../components/contributions";

export const contributionAnswerQuery = gql`
  query contribution_answer($id: uuid) {
    contribution_answers(where: { id: { _eq: $id } }) {
      id
      statuses(order_by: { created_at: desc }, limit: 1) {
        createdAt: created_at
        status
        user {
          name
        }
      }
    }
  }
`;

export type ContributionAnswerRequest = {
  id: string;
};

export type ContributionAnswerResponse = {
  contribution_answers: {
    id: string;
    statuses: {
      status: Status;
    }[];
  }[];
};
