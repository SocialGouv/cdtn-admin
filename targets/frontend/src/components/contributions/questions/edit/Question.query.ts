import { CombinedError, gql, useQuery } from "urql";

import { Message, QuestionBase } from "../../type";

export const contributionQuestionQuery = gql`
  query SelectQuestion($questionId: uuid!) {
    question: contribution_questions_by_pk(id: $questionId) {
      content
      order
      id
      seo_title
      message_id
    }

    messages: contribution_question_messages {
      contentAgreement
      contentLegal
      contentNotHandled
      contentNotHandledWithoutLegal
      contentAgreementWithoutLegal
      id
      label
    }
  }
`;

type QueryProps = {
  questionId: string;
};

type QueryOutput = {
  question: QuestionBase | null;
  messages: Message[];
};

export type QueryResult = {
  question: QuestionBase | null;
  messages: Message[];
};

type Result = {
  data?: QueryResult;
  error?: CombinedError;
  fetching: boolean;
};

export const useQuestionQuery = ({ questionId }: QueryProps): Result => {
  const [{ data, error, fetching }] = useQuery<QueryOutput>({
    query: contributionQuestionQuery,
    requestPolicy: "cache-and-network",
    variables: {
      questionId,
    },
  });

  return { data, fetching, error };
};
