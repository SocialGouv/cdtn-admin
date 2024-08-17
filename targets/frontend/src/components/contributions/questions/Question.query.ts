import { gql, useQuery } from "urql";

import { QuestionBase } from "../type";

export const contributionQuestionQuery = gql`
  query SelectQuestion($questionId: uuid!) {
    contribution_questions_by_pk(id: $questionId) {
      content
      order
    }
  }
`;

export type QuestionTitle = Pick<QuestionBase, "content" | "order">;

type QueryProps = {
  questionId: string;
};

type QueryOutput = {
  contribution_questions_by_pk: QuestionTitle | null;
};

export const useQuestionQuery = ({ questionId }: QueryProps): QuestionTitle => {
  const [result, reExecute] = useQuery<QueryOutput>({
    query: contributionQuestionQuery,
    requestPolicy: "network-only",
    variables: {
      questionId,
    },
  });
  if (result?.error) {
    console.error(result.error);
    return {
      content: "",
      order: -1,
    };
  }
  if (!result?.data) {
    return {
      content: "",
      order: -1,
    };
  }
  if (!result?.data?.contribution_questions_by_pk) {
    return {
      content: "",
      order: -1,
    };
  }
  return result.data.contribution_questions_by_pk;
};
