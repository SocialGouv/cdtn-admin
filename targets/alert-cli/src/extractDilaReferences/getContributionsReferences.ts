import { client } from "@shared/graphql-client";

const getContributionsWithRefs = `
query getContributionsWithRefs {
  contribution_answers {
    id
    question {
      content
    }
    kali_references {
      kali_article {
        cid
        id
        label
        agreement {
          kali_id
        }
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
  contribution_answers: ContributionAnswer[];
}

interface ContributionAnswer {
  id: string;
  question: Question;
  kali_references: KaliReference[];
  legi_references: LegiReference[];
  fiche_sp: FicheSP | null;
}

interface FicheSP {
  cdtn_id: string;
  initial_id: string;
}

interface KaliReference {
  kali_article: IArticle;
}

interface IArticle {
  cid: string;
  id: string;
  label: null | string;
  agreement?: Agreement;
}

interface Agreement {
  kali_id: string;
}

interface LegiReference {
  legi_article: IArticle;
}

interface Question {
  content: string;
}

export async function getContributionsWithReferences(): Promise<
  ContributionAnswer[]
> {
  const res = await client
    .query<ContributionsHasuraResult>(getContributionsWithRefs, {})
    .toPromise();

  if (res.error || !res.data) {
    console.error(res.error && "no data received");
    throw new Error("getContributionsWithReferences");
  }

  return res.data.data.contribution_answers;
}
