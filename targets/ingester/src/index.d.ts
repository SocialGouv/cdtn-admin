import type { SourceValues } from "@socialgouv/cdtn-sources";

import {
  Answer,
  BaseRef,
  ContributionGenericDoc,
  ContributionReference,
  ContributionWithCCDoc,
  DilaRef,
  GenericAnswer,
} from "@shared/types";

export as namespace ingester;

interface Document {
  id: string;
  description: string;
  title: string;
  source: SourceValues;
  text: string;
  slug: string;
  is_searchable: boolean;
  is_published?: boolean;
}

type ExternalDocument = Document & {
  url: string;
};

interface GenericAnswer {
  content: string;
  description: string;
  contentType: string;
  text: string;
  references: ContributionReference[];
}

type AnswerWithCC = Answer & { idcc: string; shortName: string };

export interface Question {
  id: string;
  // index: number; => not needed ??
  title: string;
  answers: {
    generic: GenericAnswer;
    conventions: AnswerWithCC[];
  };
}

type Contribution = Document & (ContributionGenericDoc | ContributionWithCCDoc);

type LegiArticle = ExternalDocument & {
  dateDebut: number;
  html: string;
};

type FicheServicePublic = ExternalDocument & {
  date: string; //"O1/01/2021"
  raw: string;
  referencedTexts: ServicePublicReferences[];
};

type FicheTravailEmploi = ExternalDocument & {
  date: string; // "30/09/2020",
  intro: string;
  sections: TravailEmploiSection[];
};

interface TravailEmploiSection {
  title: string;
  anchor: string;
  html: string;
  text: string;
  description: string;
  references: TravailEmploiReference[];
}

type AgreementPage = Document & {
  num: number;
  publishDate?: string;
  effectif?: number;
  mtime?: number;
  shortTitle: string;
  answers: AgreementAnswer[];
  url?: string;
  articlesByTheme: AgreementArticleByBlock[];
  synonymes?: string[];
};

interface AgreementAnswer {
  index: number;
  references: (BaseRef | DilaRef)[];
  slug: string;
  question: string;
  answer: string;
}

interface AgreementArticleByBlock {
  bloc: string;
  articles: {
    cid: string;
    id: string;
    section: string;
    title: string;
  }[];
}

/** Document type */
type CdtnDocument =
  | AgreementPage
  | Contribution
  | FicheServicePublic
  | FicheTravailEmploi
  | LegiArticle;
