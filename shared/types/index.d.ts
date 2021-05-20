import type {
  Answer,
  GenericAnswer,
  IndexedAgreement,
  Reference as ContributionReference,
} from "@socialgouv/contributions-data-types";
import type { CodeArticleData } from "@socialgouv/legi-data-types";

export as namespace admin;

interface BaseHasuraDocument {
  cdtn_id: string;
  initial_id: string;
  is_available: boolean;
  is_searchable: boolean;
  is_published: boolean;
  meta_description: string;
  slug: string;
  title: string;
  text: string;
  created_at: Date;
  updated_at: Date;
}

type FicheTravailEmploi = BaseHasuraDocument & {
  source: "fiches_ministere_travail";
  document: FicheTravailEmploiDoc;
};

type ContributionComplete = BaseHasuraDocument & {
  source: "contributions";
  document: ContributionCompleteDoc;
};

type ContributionFiltered = BaseHasuraDocument & {
  source: "contributions";
  document: ContributionFilteredDoc;
};

type LaborCodeArticle = BaseHasuraDocument & {
  source: "code_du_travail";
  document: LaborCodeDoc;
};

type FicheServicePublic = BaseHasuraDocument & {
  source: "fiches_service_public";
  document: FicheServicePublicDoc;
};

type Agreement = BaseHasuraDocument & {
  source: "conventions_collectives";
  document: AgreementDoc;
};

type HasuraDocument =
  | Agreement
  | ContributionComplete
  | ContributionFiltered
  | FicheServicePublic
  | FicheTravailEmploi
  | LaborCodeArticle;
/**
 * Document Table's document type
 */

interface FicheTravailEmploiDoc {
  date: string;
  description: string;
  intro: string;
  url: string;
  sections: Section[];
}
interface Section {
  anchor: string;
  html: string;
  text: string;
  title: string;
  description: string;
  references: TravailEmploiReference[];
}

interface TravailEmploiReference {
  id: string;
  cid: string;
  slug: string;
  title: string;
  type: "code_du_travail" | "conventions_collectives";
  url: string;
}

interface ContributionCompleteDoc {
  index: number;
  split: false;
  description: string;
  answers: CCMultipleAnswers;
}

interface ContributionFilteredDoc {
  index: number;
  split: true;
  description: string;
  answers: CCSingleAnswer;
}

interface CCMultipleAnswers {
  generic: GenericAnswer;
  conventions: Answer[];
}

interface CCSingleAnswer {
  generic: GenericAnswer;
  conventionAnswer: Answer;
}

type LaborCodeDoc = Pick<CodeArticleData, "cid" | "dateDebut" | "id"> & {
  description: string;
  html: string;
  url: string;
  notaHtml?: string;
};

interface FicheServicePublicDoc {
  raw: string;
  url: string;
  date: string;
  description: string;
  referencedTexts: ServicePublicReference[];
}

type ServicePublicReference =
  | ServicePublicExternalReference
  | ServicePublicInternalReference;

interface ServicePublicInternalReference {
  title: string;
  slug: string;
  type: "code_du_travail" | "conventions_collectives";
}

interface ServicePublicExternalReference {
  title: string;
  url: string;
  type: "external";
}

type AgreementDoc = Pick<
  IndexedAgreement,
  "date_publi" | "effectif" | "mtime" | "num" | "shortTitle" | "url"
> & {
  description: string;
  answers: AgreementContribAnswer[];
  articleByTheme: ArticleTheme[];
};

interface AgreementContribAnswer {
  slug: string;
  index: string;
  answer: string;
  question: string;
  references: ContributionReference[];
}

interface ArticleTheme {
  bloc: "string";
  articles: {
    id: string;
    cid: string;
    title: string;
    section: string;
  };
}

interface KaliArticleHDN {
  idcc: number;
  title: string;
  id: string;
  blocks: Record<string, string[]>;
}

export interface KaliBlock {
  id: string;
  idcc: number;
  title: string;
  blocks: Blocks;
}

export interface Blocks {
  "1"?: string[];
  "2"?: string[];
  "4"?: string[];
  "6": string[];
  "7"?: string[];
  "9"?: string[];
  "10"?: string[];
  "15"?: string[];
  "16"?: string[];
  "3"?: string[];
  "5"?: string[];
  "11"?: string[];
}

export interface ParseDilaReference {
  url: string;
  category: string;
  title: string;
  dila_id: string;
  dila_cid: string;
  dila_container_id: string;
}
