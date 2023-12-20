import { ContributionsAnswers } from "@shared/types";
import { gqlClient } from "@shared/utils";

const getContributionsWithRefs = `
query getContribsWithSp {
  contribution_answers(where: {content_service_public_cdtn_id: {_neq: NULL}}) {
    id
    question {
      id
      content
      order
    }
    content_fiche_sp: document {
      initial_id
      document
    }
  }
}
`;

interface ContributionsHasuraResult {
  contribution_answers: Required<
    Pick<ContributionsAnswers, "id" | "question" | "content_fiche_sp">
  >[];
}

export async function queryContributionsWithFicheSp(): Promise<
  ContributionsHasuraResult["contribution_answers"]
> {
  const res = await gqlClient()
    .query<ContributionsHasuraResult>(getContributionsWithRefs, {})
    .toPromise();

  if (res.error || !res.data) {
    throw new Error(
      "Erreur de récupération des références des contributions au sein de queryContributionsReferences"
    );
  }

  return res.data.contribution_answers;
}
