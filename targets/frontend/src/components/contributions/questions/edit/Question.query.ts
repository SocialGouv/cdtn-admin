import { CombinedError, gql, useQuery } from "urql";

import { QuestionBase } from "../../type";
import { QuestionMessage } from "../common/messageBlock";

export const contributionQuestionQuery = gql`
  query SelectQuestion($questionId: uuid!) {
    question: contribution_questions_by_pk(id: $questionId) {
      content
      order
      id
      seo_title
      message_id
      introduction_nothing
      introduction_cdt
      template_answer
      message {
        id
        label
        contentAgreement
        contentAgreementWithoutLegal
        contentLegal
        contentNotHandled
        contentNotHandledWithoutLegal
        questions_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`;

type QueryProps = {
  questionId: string;
};

type QuestionWithMessage = QuestionBase & { message?: QuestionMessage | null };

type QueryOutput = {
  question: QuestionWithMessage | null;
};

export type QueryResult = {
  question: QuestionWithMessage | null;
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
