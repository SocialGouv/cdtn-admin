import { ContributionHighlight, ContributionRef } from "../contributions";

export interface AgreementsGenerated {
  num: number;
  answers: Answer[];
  shortTitle: string;
  description: string;
  is_published?: boolean;
  articlesByTheme: ArticleByTheme[];
  url?: string;
  mtime?: number;
  effectif?: number;
  date_publi?: Date;
  highlight?: ContributionHighlight;
  synonymes?: string[];
}

// Type pour les réponses
export interface Answer {
  slug: string;
  index: number;
  answer: string;
  question: string;
  references: ContributionRef[];
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
