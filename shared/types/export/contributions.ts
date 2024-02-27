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
  messageBlockGenericNoCDTUnextendedCC: string;
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

export interface OldContributionReference {
  url: string;
  title: string;
  category: string;
  dila_id?: string;
  dila_cid: string;
  dila_container_id: string;
}

export interface OldContributionElasticDocument {
  index: number;
  split: boolean;
  description: string;
  cdtnId: string;
  excludeFromSearch: boolean;
  id: string;
  isPublished: boolean;
  metaDescription: string;
  refs: OldContributionReference[];
  slug: string;
  source: string;
  text: string;
  title: string;
  answers: {
    generic: {
      id: string;
      text: string;
      markdown: string;
      references: OldContributionReference[];
      description: string;
    };
    conventionAnswer?: {
      id: string;
      idcc: string;
      markdown: string;
      shortName: string;
      references: OldContributionReference[];
    };
  };
  breadcrumbs: {
    label: string;
    position: number;
    slug: string;
  }[];
}
