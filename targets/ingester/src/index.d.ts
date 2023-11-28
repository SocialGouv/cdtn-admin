import type { SourceValues } from "@socialgouv/cdtn-sources";

import {
  Answer,
  GenericContributionDoc,
  CustomizedContributionDoc,
  LegalRef,
  FicheServicePublicDoc,
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

type GenericAnswer = Omit<Answer, "content"> & {
  description: string;
  text: string;
  content?: string | FicheServicePublicDoc;
};
type AnswerWithCC = Answer & { idcc: string; shortName: string };

export interface Question {
  id: string;
  order: number;
  title: string;
  answers: {
    generic: GenericAnswer;
    conventions: AnswerWithCC[];
  };
}

type Contribution = Document &
  (GenericContributionDoc | CustomizedContributionDoc);

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
  url?: string;
  synonymes?: string[];
  longTitle: string;
  date_publi?: string;
};

/** Document type */
type CdtnDocument =
  | AgreementPage
  | Contribution
  | FicheServicePublic
  | FicheTravailEmploi
  | LegiArticle;
