import {
  ContributionContentType,
  ContributionHighlight,
  ContributionLinkedContent,
  ContributionRef,
} from "../hasura";
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

type ContributionDocumentJsonBasic = {
  references: ContributionRef[];
  contentType: ContributionContentType;
  linkedContent: ContributionLinkedContent[];
  questionIndex: number;
  questionName: string;
  questionId: string;
  description: string;
  idcc: string; // 0000 pour la générique, impossible d'être nulle
};

type ContributionDocumentJsonContent = ContributionDocumentJsonBasic & {
  type: "content";
  content: string;
};

type ContributionDocumentJsonGenericNoCDT = ContributionDocumentJsonBasic & {
  type: "generic-no-cdt";
  messageBlockGenericNoCDT: string;
  messageBlockGenericNoCDTUnextendedCC: string;
};

type ContributionDocumentJsonFicheSp = ContributionDocumentJsonBasic & {
  type: "fiche-sp";
  ficheSpId: string;
};

type ContributionDocumentJsonCodeDuTravailReference =
  ContributionDocumentJsonBasic & {
    type: "cdt";
    genericAnswerId: string;
  };

export type ContributionDocumentJson =
  | ContributionDocumentJsonContent
  | ContributionDocumentJsonGenericNoCDT
  | ContributionDocumentJsonFicheSp
  | ContributionDocumentJsonCodeDuTravailReference;

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
  ContributionDocumentJson &
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
