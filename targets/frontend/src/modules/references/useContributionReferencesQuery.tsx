import { useQuery } from "urql";
import { gql } from "@urql/core";

const getContributionsReferencesWithDocumentInitialId = gql`
  query getContributionsReferencesById($id: String!) {
    contribution_answer_cdtn_references(
      where: { document: { initial_id: { _eq: $id } } }
    ) {
      answer {
        id
        agreement_id
        question {
          order
          content
        }
      }
    }
  }
`;

type Props = {
  id: string;
};

type HasuraReturn = {
  contribution_answer_cdtn_references: Array<{
    answer: {
      id: string;
      agreement_id: string;
      question: {
        order: number;
        content: string;
      };
    };
  }>;
};

export type ContributionReferences = {
  answerId: string;
  questionIndex: string;
  questionName: string;
  agreementId: string;
};

export const useContributionReferencesQuery = ({
  id,
}: Props): ContributionReferences[] => {
  const [result] = useQuery<HasuraReturn>({
    query: getContributionsReferencesWithDocumentInitialId,
    variables: {
      id,
    },
  });

  if (!result.data) {
    return [];
  }
  return result.data.contribution_answer_cdtn_references.map((v) => ({
    answerId: v.answer.id,
    questionName: v.answer.question.content,
    agreementId: v.answer.agreement_id,
    questionIndex: v.answer.question.order.toString(),
  }));
};
