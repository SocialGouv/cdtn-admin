import { useQuery } from "urql";

import { Question, QuestionEntity } from "./type";

export const contributionAnswerQuery = `
query SelectQuestion($questionId: uuid) {
  contribution_questions(where: {id: {_eq: $questionId}}) {
    content
    id
  }
}
`;

type QueryProps = {
  questionId: string;
};

type QueryResult = {
  contribution_questions: QuestionEntity[];
};

export const useQuestionQuery = ({
  questionId,
}: QueryProps): Question | undefined | "not_found" => {
  const [result] = useQuery<QueryResult>({
    query: contributionAnswerQuery,
    requestPolicy: "cache-and-network",
    variables: {
      questionId,
    },
  });
  if (!result?.data) {
    return;
  }
  if (
    !result?.data?.contribution_questions ||
    result?.data.contribution_questions?.length == 0
  ) {
    return "not_found";
  }
  const data = result.data.contribution_questions[0];
  return {
    content: data.content,
    id: data.id,
  };
};
