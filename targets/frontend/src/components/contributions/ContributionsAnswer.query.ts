import { useQuery } from "urql";

import { Answer } from "./type";

export const contributionAnswerQuery = `query contribution_answer($idQuestion: uuid, $idCc: bpchar) {
    contribution_answers(where: {
      _and: {
        id_question: {_eq: $idQuestion},
        id_cc: {_eq: $idCc}
      }
    }) {
      idQuestion: id_question
      idCc: id_cc
      content
      otherAnswer: other_answer
      status
      question {
        id
        content
      }
      agreement {
        id
        name
      }
    }
  }
  `;

type QueryProps = {
  idQuestion: string;
  idCc: string;
};

type QueryResult = {
  contribution_answers: Answer[];
};

export const useContributionAnswerQuery = ({
  idCc,
  idQuestion,
}: QueryProps): Answer | undefined => {
  const [result] = useQuery<QueryResult>({
    query: contributionAnswerQuery,
    requestPolicy: "cache-and-network",
    variables: {
      idCc,
      idQuestion,
    },
  });
  if (
    !result?.data?.contribution_answers ||
    !result?.data?.contribution_answers?.length
  ) {
    return;
  }
  return result.data?.contribution_answers[0];
};
