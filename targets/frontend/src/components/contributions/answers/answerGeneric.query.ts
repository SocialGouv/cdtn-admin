import { useQuery } from "urql";
import { AnswerWithStatus } from "./answer.query";

const contributionGenericAnswerQuery = `
query contribution_answer($questionId: uuid) {
  contribution_answers(where: {question_id: {_eq: $questionId}, agreement_id: {_eq: "0000"}}) {
    contentType: content_type
  }
}
`;

type QueryProps = {
  questionId?: string;
};

type QueryResult = {
  contribution_answers: AnswerWithStatus[];
};

export const useGenericContributionAnswerQuery = ({
  questionId,
}: QueryProps): Pick<AnswerWithStatus, "contentType"> | undefined => {
  const [resultGeneric] = useQuery<QueryResult>({
    query: contributionGenericAnswerQuery,
    variables: {
      questionId,
    },
  });
  const genericAnswer = resultGeneric.data?.contribution_answers[0];
  if (!genericAnswer) {
    return;
  }
  return genericAnswer;
};
