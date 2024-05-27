import { AgreementDoc } from "../hasura";
import { DocumentElasticWithSource } from "./common";

export type ElasticAgreement = DocumentElasticWithSource<AgreementDoc> & {
  articlesByTheme: ArticleByTheme[];
  source: "conventions_collectives";
  description: string;
  answers: ExportAnswer[];
  contributions: boolean;
};

// Type pour les réponses
export type ExportAnswer = {
  theme?: string;
  slug: string;
  title: string;
  questionIndex: number;
};

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
