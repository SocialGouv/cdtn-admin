import { ContributionsAnswers } from "@socialgouv/cdtn-types";
import { gqlClient } from "@shared/utils";

const getContributionsWithRefs = `
query getContributionsWithRefs {
  contribution_answers {
    id
    question {
      id
      content
      order
      seo_title
    }
    kali_references {
      label
      kali_article {
        id
        path
        cid
        label
      }
    }
    legi_references {
      legi_article {
        cid
        id
        label
      }
    }
    agreement {
      id
      name
      kali_id
    }
    document {
      slug
    }
  }
}
`;

interface ContributionsHasuraResult {
  contribution_answers: Pick<
    ContributionsAnswers,
    "id" | "question" | "legi_references" | "kali_references" | "agreement" | "document"
  >[];
}

export async function queryContributionsReferences(): Promise<
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
