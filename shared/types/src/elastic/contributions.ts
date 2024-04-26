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

export type ElasticSearchContributionGeneric = ContributionElasticDocumentBase &
  ContributionGenericInfos;

export type ElasticSearchContributionConventionnelle =
  ContributionElasticDocumentBase & ContributionConventionnelInfos;

export type ElasticSearchContribution =
  | ElasticSearchContributionGeneric
  | ElasticSearchContributionConventionnelle;

export type ElasticSearchContributionWithInfoMessage =
  ElasticSearchContribution & {
    infoMessage: string;
  };
