import { ContributionDocumentJson, ContributionHighlight } from "../hasura";
import { Breadcrumb, DocumentElasticWithSource } from "./common";

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
  date: string;
}

export interface ContributionContentBase {
  content: string;
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

export interface ExportFullLinkedContent {
  breadcrumbs: Breadcrumb[];
  description: string;
  source: string;
  slug: string;
  title: string;
}

export interface ExportContributionFullLinkedContent {
  linkedContent: ExportFullLinkedContent[];
}

type ExportContributionInfo = {
  breadcrumbs: Breadcrumb[];
  highlight?: ContributionHighlight;
  messageBlock?: string;
};

type ContributionElasticDocumentBase = Omit<
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
  title: string;
  slug: string;
  breadcrumbs: Breadcrumb[];
  source: "contributions";
  linkedContent: ContributionLinkedContent[];
  references: ContributionRef[];
  idcc: string;
  messageBlock?: string;
} & (
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
