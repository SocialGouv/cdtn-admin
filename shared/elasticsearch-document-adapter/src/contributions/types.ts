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

export type ContributionContent =
  | ContributionContentBase
  | ContributionFicheSpContent;

export type ContributionElasticDocument =
  DocumentElasticWithSource<ContributionDocumentJson> &
    ContributionMetadata &
    ContributionContent &
    (ContributionGenericInfos | ContributionConventionnelInfos) & {
      breadcrumbs: Breadcrumbs[] | Record<number, Breadcrumbs[]>;
      highlight?: ContributionHighlight;
    };
