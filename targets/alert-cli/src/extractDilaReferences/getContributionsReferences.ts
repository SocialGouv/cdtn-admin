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

export interface ContributionsHasuraResult {
  data: Data;
}
export interface Data {
  contribution_answers?: ContributionAnswersEntity[] | null;
}
export interface ContributionAnswersEntity {
  id: string;
  question: Question;
  kali_references: KaliReferencesEntity[];
  legi_references: LegiReferencesEntity[];
  fiche_sp?: FicheSp | null;
}
export interface Question {
  content: string;
}
export interface KaliReferencesEntity {
  kali_article: KaliArticle;
}
export interface KaliArticle {
  cid: string;
  id: string;
  label?: string | null;
}
export interface LegiReferencesEntity {
  legi_article: KaliArticleOrLegiArticle;
}
export interface KaliArticleOrLegiArticle {
  cid: string;
  id: string;
  label: string;
}
export interface FicheSp {
  cdtn_id: string;
  initial_id: string;
}

export async function getContributionsWithReferences(): Promise<
  ContributionAnswersEntity[]
> {
  const res = await client
    .query<ContributionsHasuraResult>(getContributionsWithRefs, {})
    .toPromise();

  if (res.error || !res.data) {
    console.error(res.error && "no data received");
    throw new Error("getContributionsWithReferences");
  }

  return res.data.data.contribution_answers ?? [];
}
