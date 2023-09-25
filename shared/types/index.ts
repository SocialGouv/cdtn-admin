import type {
  CodeArticle,
  CodeArticleData,
  CodeSection,
} from "@socialgouv/legi-data-types";
import type {
  AgreementArticle,
  AgreementSection,
  IndexedAgreement,
} from "@socialgouv/kali-data-types";
import type {
  Prequalified,
  Highlight,
  EditorialContent,
} from "./EditorialContent";
export * from "./EditorialContent";
export * from "./utils";
import type { BaseHasuraDocument } from "./Base";

export enum DOCUMENT_SOURCE {
  fiches_ministere_travail = "fiches_ministere_travail",
  contributions = "contributions",
  code_du_travail = "code_du_travail",
  fiches_service_public = "fiches_service_public",
  conventions_collectives = "conventions_collectives",
  prequalified = "prequalified",
  themes = "themes",
  modeles_de_courriers = "modeles_de_courriers",
  information = "information",
  highlights = "highlights",
}

export type FicheTravailEmploi = BaseHasuraDocument & {
  source: "fiches_ministere_travail";
  document: FicheTravailEmploiDoc;
};

export type ContributionComplete = BaseHasuraDocument & {
  source: "contributions";
  document: ContributionCompleteDoc;
};

export type ContributionFiltered = BaseHasuraDocument & {
  source: "contributions";
  document: ContributionFilteredDoc;
};

export type LaborCodeArticle = BaseHasuraDocument & {
  source: "code_du_travail";
  document: LaborCodeDoc;
};

export type FicheServicePublic = BaseHasuraDocument & {
  source: "fiches_service_public";
  document: FicheServicePublicDoc;
};

export type Agreement = BaseHasuraDocument & {
  source: "conventions_collectives";
  document: AgreementDoc;
};

export type Theme = BaseHasuraDocument & {
  source: "themes";
  document: ThemeDoc;
};

export type MailTemplate = BaseHasuraDocument & {
  source: "modeles_de_courriers";
  document: MailTemplateDoc;
};

export type HasuraDocument =
  | Agreement
  | ContributionComplete
  | ContributionFiltered
  | FicheServicePublic
  | FicheTravailEmploi
  | LaborCodeArticle
  | MailTemplate
  | Theme
  | Prequalified
  | Highlight
  | EditorialContent;

/**
 * Document Table's document type
 */
export type ThemeDoc = {
  icon?: string;
  shortTitle?: string;
  description?: string;
};

export type MailTemplateDoc = {
  date: string;
  html: string;
  author: string;
  fileUrl: string;
  filename: string;
  filesize: number;
  description: string;
  references?: {
    url: string;
    title: string;
    type: string;
  }[];
};

export interface FicheTravailEmploiDoc {
  date: string;
  description: string;
  intro: string;
  url: string;
  sections: Section[];
}

export interface Section {
  anchor: string;
  html: string;
  text: string;
  title: string;
  description: string;
  references: TravailEmploiReference[];
}

export interface TravailEmploiReference {
  id: string;
  cid: string;
  slug: string;
  title: string;
  type: "code_du_travail" | "conventions_collectives";
  url: string;
}

export interface ContributionCompleteDoc {
  index: number;
  description: string;
  answers: CCMultipleAnswers;
}

export interface ContributionFilteredDoc {
  index: number;
  iddc: string;
  description: string;
  answer: CCSingleAnswer;
}

export interface CCMultipleAnswers {
  generic: GenericAnswer;
  conventions: {
    idcc: string;
    shortName: string;
  }[];
}

export interface CCSingleAnswer {
  conventionAnswer: Answer;
}

export type LaborCodeDoc = Pick<CodeArticleData, "cid" | "dateDebut" | "id"> & {
  description: string;
  html: string;
  url: string;
  notaHtml?: string;
};

export interface FicheServicePublicDoc {
  raw: string;
  url: string;
  date: string;
  description: string;
  referencedTexts: ServicePublicReference[];
}

export type ServicePublicReference =
  | ServicePublicExternalReference
  | ServicePublicInternalReference;

export interface ServicePublicInternalReference {
  title: string;
  slug: string;
  type: "code_du_travail" | "conventions_collectives";
}

export interface ServicePublicExternalReference {
  title: string;
  url: string;
  type: "external";
}

export type AgreementDoc = Pick<
  IndexedAgreement,
  "date_publi" | "effectif" | "mtime" | "num" | "shortTitle" | "url"
> & {
  highlight: unknown;
  description: string;
  answers: AgreementContribAnswer[];
  articleByTheme: ArticleTheme[];
};

export interface AgreementContribAnswer {
  slug: string;
  index: string;
  answer: string;
  question: string;
  references: ContributionReference[];
}

export interface ArticleTheme {
  bloc: "string";
  articles: {
    id: string;
    cid: string;
    title: string;
    section: string;
  };
}

export interface KaliArticleHDN {
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

/**
 * Alerts
 */

export type HasuraAlert = {
  id: string;
  info: AlertInfo;
  status: string;
  repository: string;
  ref: string;
  changes: AlertChanges;
  created_at: Date;
  updated_at: Date;
};

export type AlertInfo = { id: string };

export type AlertChanges =
  | DilaAlertChanges
  | TravailDataAlertChanges
  | VddAlertChanges
  | DaresAlertChanges;

/** Dila alert changes */
export type DilaAlertChanges = DilaChanges & {
  type: "dila";
  ref: string;
  title: string;
  date: Date;
  id: string;
  file: string;
  num?: number;
};

export type DilaChanges = {
  modified: DilaModifiedNode[];
  added: DilaAddedNode[];
  removed: DilaRemovedNode[];
  documents: DocumentReferences[];
};

export type DilaAddedNode = {
  etat: string;
  parents: string[];
  title: string;
  id: string;
  cid: string;
};

export type DilaRemovedNode = {
  parents: string[];
  title: string;
  id: string;
  cid: string;
};

export type DilaModifiedNode = {
  parents: string[];
  title: string;
  id: string;
  cid: string;
  etat: string;
  diffs: DiffInfo[];
};

export type DilaNode =
  | AgreementArticle
  | AgreementSection
  | CodeArticle
  | CodeSection;

export type DilaArticle = AgreementArticle | CodeArticle;
export type DilaSection = AgreementSection | CodeSection;

export type DiffInfo = {
  type: "etat" | "nota" | "texte";
  currentText: string;
  previousText: string;
};

export type DocumentReferences = {
  document: DocumentInfo;
  references: DocumentReference[];
};

export type DocumentReference = Pick<
  DilaRef,
  "dila_cid" | "dila_container_id" | "dila_id" | "title" | "url"
>;

export type DocumentInfo = Pick<HasuraDocument, "source" | "title"> & {
  id: string;
};
export type DocumentInfoWithCdtnRef = DocumentInfo & {
  ref: Pick<DocumentInfo, "id" | "title">;
};

/** Fiche travail alert changes */
export type TravailDataAlertChanges = TravailDataChanges & {
  type: "travail-data";
  title: string;
  ref: string;
  date: Date;
};

export type TravailDataChanges = {
  added: FicheTravailEmploiInfo[];
  removed: FicheTravailEmploiInfo[];
  modified: FicheTravailEmploiInfoWithDiff[];
  documents: DocumentInfoWithCdtnRef[];
};

export type FicheTravailEmploiInfo = {
  pubId: string;
  title: string;
  url: string;
};

export type FicheTravailEmploiInfoWithDiff = FicheTravailEmploiInfo & {
  removedSections: SectionTextChange[];
  addedSections: SectionTextChange[];
  modifiedSections: SectionTextChange[];
};

export type SectionTextChange = {
  title: string;
  currentText: string;
  previousText: string;
};

/** fiche vdd  alert changes*/
export type VddAlertChanges = VddChanges & {
  type: "vdd";
  title: string;
  ref: string;
  date: Date;
};

export type DaresAlertChanges = {
  type: "dares";
  title: string;
  ref: string;
  date: Date;
  modified: [];
  added: {
    name: string;
    num: number;
  }[];
  removed: {
    name: string;
    num: number;
  }[];
  documents: [];
};

export type DaresAlert = {
  id: string;
  info: {
    id: string | number; // idcc number
  };
  status: "doing" | "done" | "rejected" | "todo";
  repository: "dares";
  ref: string;
  changes: DaresAlertChanges;
};

export type VddChanges = {
  modified: FicheVddInfoWithDiff[];
  removed: FicheVddInfo[];
  added: FicheVddInfo[];
  documents: DocumentInfoWithCdtnRef[];
};

export type FicheVddInfo = {
  id: string;
  type: string;
  title: string;
};

export type FicheVddInfoWithDiff = FicheVddInfo & {
  currentText: string;
  previousText: string;
};

export enum Status {
  running = "running",
  completed = "completed",
  failed = "failed",
  timeout = "timeout",
}

export enum Environment {
  production = "production",
  preproduction = "preproduction",
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

export interface ExportEsStatus {
  id: string;
  environment: Environment;
  status: Status;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  user?: User;
}

export type Question = {
  id: string;
  index: number;
  title: string;
  answers: {
    generic: GenericAnswer;
    conventions: Answer[];
  };
};

export type Answer = {
  id: string;
  idcc: string;
  shortName: string;
  content: string;
  otherAnswer: string;
  references: ContributionReference[];
};

export type GenericAnswer = {
  id: string;
  content: string;
  description: string;
  text: string;
  references: ContributionReference[];
};

export type ContributionReference = BaseRef | DilaRef;

export type DilaRef = {
  url: string;
  title: string;
  dila_id: string;
  dila_cid: string;
  dila_container_id: string;
};

export type BaseRef = {
  category: null;
  title: string;
  url?: string | null;
};

export type State =
  | "ABROGE"
  | "DENONCE"
  | "MODIFIE"
  | "PERIME"
  | "REMPLACE"
  | "VIGUEUR"
  | "VIGUEUR_ETEN"
  | "VIGUEUR_NON_ETEN";
