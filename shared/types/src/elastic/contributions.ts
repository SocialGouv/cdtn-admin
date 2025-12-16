import { ContributionDocumentJson, ContributionHighlight } from "../hasura";
import { Breadcrumb, DocumentElasticWithSource } from "./common";
import { SOURCES } from "@socialgouv/cdtn-utils";
import { LinkedContent } from "./related-items";

export interface ContributionConventionnelInfos {
  ccnSlug: string;
  ccnShortTitle: string;
}

export interface ContributionGenericInfos {
  ccSupported: string[];
  ccUnextended: string[];
}

export interface ContributionMetadata {
  title: string;
  text: string;
  metas: {
    title: string;
    description: string;
  };
}

export type ContributionInfographicFull = {
  infographicId: string;
  title: string;
  svgFilename: string;
  pdfFilename: string;
  pdfFilesizeOctet: number;
  transcription: string;
};

export interface ContributionContentBase {
  content: string;
  infographics: ContributionInfographicFull[];
}

export interface ContributionFicheSpContent {
  url: string;
  date: string;
  raw: string;
  ficheSpDescription: string;
}
export interface ContributionGenericNoCDTContent {
  messageBlockGenericNoCDT: string;
}

export type ContributionContent =
  | ContributionContentBase
  | ContributionFicheSpContent
  | ContributionGenericNoCDTContent;

export interface ExportContributionFullLinkedContent {
  linkedContent: LinkedContent[];
}

type ExportContributionInfo = {
  breadcrumbs: Breadcrumb[];
  highlight?: ContributionHighlight;
  messageBlock?: string;
};

export type ContributionElasticDocumentBase = Omit<
  DocumentElasticWithSource<Omit<ContributionDocumentJson, "linkedContent">>,
  "breadcrumbs"
> &
  ContributionMetadata &
  ContributionContent &
  ExportContributionFullLinkedContent &
  ExportContributionInfo;

export type ContributionElasticDocument = ContributionElasticDocumentBase &
  (ContributionGenericInfos | ContributionConventionnelInfos);

type ElasticSearchContributionFicheSp = {
  type: "fiche-sp";
  url: string;
  raw: string;
};

type ElasticSearchContributionGenericNoCDT = {
  type: "generic-no-cdt";
  messageBlockGenericNoCDT: string;
};

type ElasticSearchContributionContent = {
  type: "content" | "cdt";
  content: string;
};

type ContributionLinkedContent = {
  slug: string;
  source: string;
  title: string;
  description?: string;
};

type ContributionRef = {
  url?: string | null;
  title: string;
};

type ElasticSearchContributionBase = {
  description: string;
  slug: string;
  breadcrumbs: Breadcrumb[];
  source: typeof SOURCES.CONTRIBUTIONS;
  linkedContent: ContributionLinkedContent[];
  references: ContributionRef[];
  idcc: string;
  messageBlock?: string;
  date: string;
} & ContributionMetadata &
  (
    | ElasticSearchContributionFicheSp
    | ElasticSearchContributionContent
    | ElasticSearchContributionGenericNoCDT
  );

export type ElasticSearchContributionGeneric = ElasticSearchContributionBase & {
  ccSupported: string[];
  ccUnextended: string[];
};

export type ElasticSearchContributionConventionnelle =
  ElasticSearchContributionBase & {
    ccnSlug: string;
    ccnShortTitle: string;
    highlight?: ContributionHighlight;
  };

export type ElasticSearchContribution =
  | ElasticSearchContributionGeneric
  | ElasticSearchContributionConventionnelle;
