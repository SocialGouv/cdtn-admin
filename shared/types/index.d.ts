import { CodeArticle, CodeArticleData } from "@socialgouv/legi-data-types";
import {
  Answer,
  GenericAnswer,
  IndexedAgreement,
  Reference as ContributionReference,
} from "@socialgouv/contributions-data-types";

import "@socialgouv/cdtn-sources";

export as namespace admin;

type BaseHasuraDocument = {
  cdtn_id: string;
  initial_id: string;
  is_available: Boolean;
  is_searchable: Boolean;
  is_published: Boolean;
  meta_description: string;
  slug: string;
  title: string;
  text: string;
  created_at: Date;
  updated_at: Date;
};

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

type FicheTravailEmploiDoc = {
  date: string;
  description: string;
  intro: string;
  url: string;
  sections: Section[];
};
interface Section {
  anchor: string;
  html: string;
  text: string;
  title: string;
  description: string;
  references: TravailEmploiReference[];
}

type TravailEmploiReference = {
  id: string;
  cid: string;
  slug: string;
  title: string;
  type: "code_du_travail" | "conventions_collectives";
  url: string;
};

type ContributionCompleteDoc = {
  index: number;
  split: false;
  description: string;
  answers: CCMultipleAnswers;
};

type ContributionFilteredDoc = {
  index: number;
  split: true;
  description: string;
  answers: CCSingleAnswer;
};

type CCMultipleAnswers = {
  generic: GenericAnswer;
  conventions: Answer[];
};

type CCSingleAnswer = {
  generic: GenericAnswer;
  conventionAnswer: Answer;
};

type LaborCodeDoc = Pick<CodeArticleData, "dateDebut" | "id" | "cid"> & {
  description: string;
  html: string;
  url: string;
  notaHtml?: string;
};

type FicheServicePublicDoc = {
  raw: string;
  url: string;
  date: string;
  description: string;
  referencedTexts: ServicePublicReference[];
};

type ServicePublicReference =
  | ServicePublicExternalReference
  | ServicePublicInternalReference;

type ServicePublicInternalReference = {
  title: string;
  slug: string;
  type: "code_du_travail" | "conventions_collectives";
};

type ServicePublicExternalReference = {
  title: string;
  url: string;
  type: "external";
};

type AgreementDoc = Pick<
  IndexedAgreement,
  "num" | "url" | "mtime" | "effectif" | "date_publi" | "shortTitle"
> & {
  description: string;
  answers: AgreementContribAnswer[];
  articleByTheme: ArticleTheme[];
};

type AgreementContribAnswer = {
  slug: string;
  index: string;
  answer: string;
  question: string;
  references: ContributionReference[];
};

type ArticleTheme = {
  bloc: "string";
  articles: {
    id: string;
    cid: string;
    title: string;
    section: string;
  };
};

type KaliArticleHDN = {
  idcc: number;
  title: string;
  id: string;
  blocks: { [key: string]: string[] };
};

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

export type ParseDilaReference = {
  url: string;
  category: string;
  title: string;
  dila_id: string;
  dila_cid: string;
  dila_container_id: string;
};
