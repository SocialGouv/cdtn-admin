import { CodeArticle } from "@socialgouv/legi-data-types";
import {
  Answer,
  IndexedAgreement,
  Reference as ContributionReference,
} from "@socialgouv/contributions-data-types";
export as namespace admin;

type HasuraDocuments = {
  cdtn_id: string;
  initial_id: string;
  is_available: Boolean;
  is_searchable: Boolean;
  is_published: Boolean;
  meta_description: string;
  slug: string;
  source: cdtnSources.SourceRoute;
  title: string;
  text: string;
  created_at: Date;
  updated_at: Date;
};

type FicheTravailEmploi = HasuraDocuments & {
  source: Pick<cdtnSources.SourceValues, "fiches_travail_emploi">;
  document: FicheTravailEmploiDoc;
};

type ContributionComplete = HasuraDocuments & {
  source: Pick<cdtnSources.SourceValues, "contributions">;
  document: ContributionCompleteDoc;
};

type ContributionFiltered = HasuraDocuments & {
  source: Pick<cdtnSources.SourceValues, "contributions">;
  document: ContributionFilteredDoc;
};

type LaborCodeArticle = HasuraDocuments & {
  source: Pick<cdtnSources.SourceValues, "code_du_travail">;
  document: LaborCodeDoc;
};

type FicheServicePublic = HasuraDocuments & {
  source: Pick<cdtnSources.SourceValues, "fiches_service_public">;
  document: FicheServicePublicDoc;
};

type Agreement = HasuraDocuments & {
  source: Pick<cdtnSources.SourceValues, "conventions_collectives">;
  document: AgreementDoc;
};

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
  title: string;
  type: "conventions_collectives" | "code_du_travail";
  url: string;
  slug: string;
};

type ContributionCompleteDoc = {
  index;
  split;
  description;
  answers: CCSingleAnswer | CCMultipleAnswers;
};

type CCMultipleAnswers = {
  generic: GenericAnswer;
  conventions: Answer[];
};

type CCSingleAnswer = {
  generic: GenericAnswer;
  conventionAnswer: Answer;
};

type LaborCodeDoc = Pick<
  CodeArticleData,
  "description" | "html" | "dateDebut" | "url"
> & {
  notaHtml?: string;
};

type FicheServicePublicDoc = {
  raw: string;
  url: string;
  date: string;
  description: string;
  referencedTexts: (ExternalReference | InternalReference)[];
};

type ServicePublicInternalReference = {
  title: string;
  slug: string;
  type: Exclude<cdtnSources.SourceRoute, "external">;
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
