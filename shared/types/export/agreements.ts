import {
  AgreementDoc,
  ContributionElasticDocument,
  OldContributionElasticDocument,
} from "../index";
import { DocumentElasticWithSource } from "./global";

export type AgreementGenerated = DocumentElasticWithSource<AgreementDoc> & {
  articlesByTheme: ArticleByTheme[];
  source: "conventions_collectives";
  description: string;
  answers: (OldExportAnswer | ExportAnswer)[];
  contributions: boolean;
};

// Type pour les réponses
export type OldExportAnswer = OldContributionElasticDocument & {
  theme?: string;
  answer: string;
  question: string;
  references: any[];
};

export type ExportAnswer = ContributionElasticDocument & {
  theme?: string;
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
