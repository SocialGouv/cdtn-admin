import type { SourceValues } from "@socialgouv/cdtn-sources";
import type {
  Answer,
  Question,
  DilaRef,
  GenericAnswer,
  BaseRef,
} from "@socialgouv/contributions-data-types";

export as namespace ingester;

type Document = {
  id: string;
  description: string;
  title: string;
  source: SourceValues;
  text: string;
  slug: string;
  is_searchable: Boolean;
};

type ExternalDocument = Document & {
  url: string;
};

type ExtendedQuestion = Omit<Question, "answers"> & {
  answers: {
    generic: GenericAnswer;
    conventionAnswer?: Answer & {
      shortName: string;
    };
    conventions?: Answer[];
  };
};

type Contribution = Document & ExtendedQuestion;

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

type TravailEmploiSection = {
  title: string;
  anchor: string;
  html: string;
  text: string;
  description: string;
  references: FicheTravailEmploiReference[];
};

type AgreementPage = Document & {
  num: number;
  date_publi?: string;
  effectif?: number;
  mtime?: number;
  shortTitle: string;
  answers: AgreementAnswer[];
  url?: string;
  articlesByTheme: AgreementArticleByBlock[];
  synonymes?: string[];
};

type AgreementAnswer = {
  index: number;
  references: (DilaRef | BaseRef)[];
  slug: string;
  question: string;
  answer: string;
};

type AgreementArticleByBlock = {
  bloc: string;
  articles: {
    cid: string;
    id: string;
    section: string;
    title: string;
  }[];
};

type FicheTravailEmploiReference = {
  id: string;
  cid: string;
  title: string;
  type: "conventions_collectives" | "code_du_travail";
  url: string;
  slug: string;
};

type ReferencedTexts = ExternalReference | InternalReference;

/** Document type */
type CdtnDocument =
  | Contribution
  | LegiArticle
  | AgreementPage
  | FicheServicePublic
  | FicheTravailEmploi;

// type EditorialDocument = Document & {
//   date: string
//   contents: EditorialContent[]
// }

// type EditorialContent = {
//   type: "markdown" | "graphic"
//   name: string
//   title: string
//   references: Reference[]
// }

// type Tool = Document & {
//   action: string
//   date: string //"O1/01/2021"
//   icon: string
// }

// type ExternalTool = ExternalDocument & {
//   action: string
//   icon: string
// }

// type DocTemplate = Document & {
//   author: string
//   date: string // "10/12/2019"
//   filename: string
//   filesize: number,
//   fileurl: string
//   html: string
// }

// type ThematicFile = {
//   categories: ThematicFileCategory[]
// }

// type ThematicFileCategory = {
//   icon: string
//   id: string
//   position: number
//   ref: ThematicFileLink[]
// }

// type ThematicFileLink = {
//   url: string
//   title: string
// }
