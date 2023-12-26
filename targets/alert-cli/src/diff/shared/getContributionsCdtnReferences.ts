import { ContributionsAnswers } from "@shared/types";
import { gqlClient } from "@shared/utils";

const getContribCdtnReferences = `
query getContribCdtnReferences($ids: [String!]) {
  contribution_answers(where: {cdtn_references: {document: {initial_id: {_in: $ids}}}}) {
    id
    question {
      id
      content
      order
    }
    cdtn_references {
      cdtn_id
      document {
        initial_id
        document
      }
    }
  }
}
`;

interface ContributionsHasuraResult {
  contribution_answers: Required<
    Pick<ContributionsAnswers, "id" | "question" | "cdtn_references">
  >[];
}

export async function getContributionsCdtnReferences(
  ids: string[]
): Promise<ContributionsHasuraResult["contribution_answers"]> {
  const res = await gqlClient()
    .query<ContributionsHasuraResult>(getContribCdtnReferences, { ids })
    .toPromise();

  if (res.error || !res.data) {
    throw new Error(
      "Erreur de récupération des références des contributions au niveau des cdtn_references"
    );
  }

  return res.data.contribution_answers;
}
