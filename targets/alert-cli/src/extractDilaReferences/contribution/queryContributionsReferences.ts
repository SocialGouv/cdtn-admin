import { ContributionsAnswers } from "@shared/types";
import { gqlClient } from "@shared/utils";

const getContributionsWithRefs = `
query getContributionsWithRefs {
  contribution_answers {
    id
    question {
      id
      content
      order
    }
    kali_references {
      label
      kali_article {
        id
        path
        cid
        label
        agreement_id
      }
    }
    legi_references {
      legi_article {
        cid
        id
        label
      }
    }
    fiche_sp: document {
      cdtn_id
      initial_id
    }
  }
}
`;

interface ContributionsHasuraResult {
  data: Data;
}

interface Data {
  contribution_answers: Pick<
    ContributionsAnswers,
    "id" | "question" | "kali_references" | "legi_references"
  >[];
}

export async function queryContributionsReferences(): Promise<
  Data["contribution_answers"]
> {
  const res = await gqlClient()
    .query<ContributionsHasuraResult>(getContributionsWithRefs, {})
    .toPromise();

  if (res.error || !res.data) {
    console.error(res.error && "no data received");
    throw new Error("getContributionsWithReferences");
  }

  return res.data.data.contribution_answers;
}
