import { ContributionDocumentJson, ContributionHighlight } from "@shared/types";
import { Breadcrumbs } from "../breadcrumbs";
import { DocumentElasticWithSource } from "../types/Glossary";

export interface ContributionConventionnelInfos {
  ccnSlug: string;
  ccnShortTitle: string;
}

export interface ContributionGenericInfos {
  ccSupported: string[];
}

export interface ContributionMetadata {
  title: string;
  description: string;
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

export interface FullLinkedContent {
  breadcrumbs: Breadcrumbs[];
  description: string;
  source: string;
  slug: string;
  title: string;
}

export interface ContributionFullLinkedContent {
  linkedContent: FullLinkedContent[];
}

export type ContributionContent =
  | ContributionContentBase
  | ContributionFicheSpContent
  | ContributionGenericNoCDTContent;

export type ContributionElasticDocument = DocumentElasticWithSource<
  Omit<ContributionDocumentJson, "linkedContent">
> &
  ContributionMetadata &
  ContributionContent &
  ContributionFullLinkedContent &
  (ContributionGenericInfos | ContributionConventionnelInfos) & {
    breadcrumbs: Breadcrumbs[] | Record<number, Breadcrumbs[]>;
    highlight?: ContributionHighlight;
    messageBlock?: string;
  };
