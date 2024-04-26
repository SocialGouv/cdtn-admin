import {
  ContributionDocumentJson,
  ContributionHighlight,
} from "../contributions";
import { Breadcrumbs, DocumentElasticWithSource } from "./global";

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
  breadcrumbs: Breadcrumbs[];
  description: string;
  source: string;
  slug: string;
  title: string;
}

export interface ExportContributionFullLinkedContent {
  linkedContent: ExportFullLinkedContent[];
}

type ExportContributionInfo = {
  breadcrumbs: Breadcrumbs[];
  highlight?: ContributionHighlight;
  messageBlock?: string;
};

export type ContributionElasticDocument = Omit<
  DocumentElasticWithSource<Omit<ContributionDocumentJson, "linkedContent">>,
  "breadcrumbs"
> &
  ContributionMetadata &
  ContributionContent &
  ExportContributionFullLinkedContent &
  ExportContributionInfo &
  (ContributionGenericInfos | ContributionConventionnelInfos);
