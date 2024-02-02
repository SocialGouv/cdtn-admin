import { useQuery } from "urql";
import { gql } from "@urql/core";

const getContributionsReferencesByIdQuery = gql`
  query getContributionsReferencesById($id: String!) {
    contribution_answer_cdtn_references(
      where: { document: { initial_id: { _eq: $id } } }
    ) {
      answer {
        id
        agreement_id
        question {
          content
        }
        document {
          slug
        }
      }
    }
  }
`;

type Props = {
  id: string;
};
type HasuraReturn = {
  contribution_answer_cdtn_references: ContributionReferences[];
};

export type ContributionReferences = {
  answer: {
    id: string;
    agreement_id: string;
    question: {
      content: string;
    };
  };
};

export const useContributionReferencesQuery = ({
  id,
}: Props): ContributionReferences[] => {
  const [result] = useQuery<HasuraReturn>({
    query: getContributionsReferencesByIdQuery,
    variables: {
      id,
    },
  });
  if (!result.data) {
    return [];
  }
  return result.data.contribution_answer_cdtn_references;
};
