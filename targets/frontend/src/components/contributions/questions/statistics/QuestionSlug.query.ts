import { CombinedError, gql, useQuery } from "urql";

export const contributionQuestionSlugQuery = gql`
  query SelectQuestionSlug($questionId: uuid!) {
    generic_answer: contribution_answers(
      where: {
        _and: [
          { agreement_id: { _eq: "0000" } }
          { question_id: { _eq: $questionId } }
        ]
      }
    ) {
      document {
        slug
      }
    }
  }
`;

type QueryProps = {
  questionId: string;
};

type QueryOutput = {
  generic_answer: { document: { slug: string } }[];
};

type Result = {
  data: string;
  error?: CombinedError;
  fetching: boolean;
};

export const useQuestionSlugQuery = ({ questionId }: QueryProps): Result => {
  const [{ data, error, fetching }] = useQuery<QueryOutput>({
    query: contributionQuestionSlugQuery,
    requestPolicy: "cache-and-network",
    variables: {
      questionId,
    },
  });

  return {
    data: data?.generic_answer?.[0]?.document?.slug ?? "",
    fetching,
    error,
  };
};
