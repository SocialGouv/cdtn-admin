import { ConventionCollectiveReference } from "@shared/types";

// Types pour les réponses
export interface AgreementsAnswers {
  slug: string;
  index: number;
  answer: string;
  question: string;
  references: ConventionCollectiveReference[];
}

export interface AnswersResultData {
  contribution_answers: AnswersResult[];
}

export interface AnswersResult {
  id: string;
  content: null | string;
  content_type:
    | "ANSWER"
    | "NOTHING"
    | "CDT"
    | "UNFAVOURABLE"
    | "UNKNOWN"
    | "SP"
    | null;
  question_id: string;
  question: {
    content: string;
    order: number;
  };
  kali_references: {
    label: string;
    kali_article: {
      id: string;
      path?: string;
      cid: string;
      label: string;
      agreement?: {
        kali_id: string;
      };
    };
  }[];
  legi_references: {
    legi_article: {
      id: string;
      path?: string;
      cid: string;
      label: string;
    };
  }[];
  other_references: {
    label: string;
    url: string;
  }[];
  cdtn_references: {
    title: string;
    source: string;
    slug: string;
  }[];
  content_fiche_sp: null | {
    document: Record<string, any>;
  };
}

// Types pour les Kali-Blocks
export interface ArticleByTheme {
  bloc: string;
  articles: {
    id: string;
    cid: string;
    title: string;
    section: string;
  }[];
}

export interface KaliBlockByIdccResult {
  kali_blocks: {
    id: string;
    blocks: { [key: string]: string[] };
  }[];
}

export interface KaliArticlesByIdResult {
  kali_articles: {
    id: string;
    cid: string;
    label: string;
    section: string;
  }[];
}
