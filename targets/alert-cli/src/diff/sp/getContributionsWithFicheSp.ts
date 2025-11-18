import { ContributionsAnswers } from "@socialgouv/cdtn-types";
import { gqlClient } from "@shared/utils";

const queryGetContributionsWithRefs = `
query getContribsWithSp($ficheSpIds: [String!]) {
  contribution_answers(where: {document: {initial_id: {_in: $ficheSpIds}}}) {
    id
    question {
      id
      content
      order
      seo_title
    }
    content_fiche_sp: document_fiche_sp {
      initial_id
      document
    }
    document {
      slug
    }
  }
}
`;

interface ContributionsHasuraResult {
  contribution_answers: Required<
    Pick<ContributionsAnswers, "id" | "question" | "content_fiche_sp"> & {
      document: { slug: string };
    }
  >[];
}

export async function getContributionsWithFicheSp(
  ficheSpIds: string[]
): Promise<ContributionsHasuraResult["contribution_answers"]> {
  const res = await gqlClient()
    .query<ContributionsHasuraResult>(queryGetContributionsWithRefs, {
      ficheSpIds,
    })
    .toPromise();

  if (res.error || !res.data) {
    throw new Error(
      "Erreur de récupération des références des contributions au sein de queryContributionsReferences"
    );
  }

  return res.data.contribution_answers;
}
