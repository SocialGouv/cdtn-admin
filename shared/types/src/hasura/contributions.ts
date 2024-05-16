import { HasuraDocument } from "./common";
import { FicheServicePublicDoc } from "./fiche-sp";

export type ContributionsAnswers = {
  id: string;
  content: string | null;
  description: string | null;
  content_type: ContributionContentType;
  question: ContributionQuestion;
  kali_references: ContributionKaliReferences[];
  legi_references: ContributionLegiReferences[];
  other_references: ContributionOtherReferences[];
  cdtn_references: Partial<ContributionCdtnReferences>[];
  content_fiche_sp: ContributionContentFicheSp | null;
  message_block_generic_no_CDT: string | null;
  agreement: ContributionAgreement;
};

export type ContributionQuestion = {
  id: string;
  content: string;
  order: number;
};

export type ContributionKaliReferences = {
  label: string;
  kali_article: ContributionKaliReferencesKaliArticle;
};

export type ContributionKaliReferencesKaliArticle = {
  id: string;
  path?: string;
  cid: string;
  label: string;
};

export type ContributionOtherReferences = {
  label: string;
  url: string;
};

export type ContributionAgreement = {
  id: string; // 0000 pour la générique, impossible d'être nulle
  name: string;
  kali_id: string;
};

export type ContributionCdtnReferences = {
  cdtn_id: string;
  answer: ContributionsAnswers;
  answer_id: string;
  document: Partial<HasuraDocument<any>>;
};

export type ContributionContentFicheSp = {
  initial_id: string;
  document: FicheServicePublicDoc;
};

export type ContributionLegiReferences = {
  legi_article: {
    id: string;
    path?: string;
    cid: string;
    label: string;
  };
  messageBlockGenericNoCDT: null | string;
};

export type ContributionContentType =
  | "ANSWER"
  | "NOTHING"
  | "GENERIC_NO_CDT"
  | "CDT"
  | "UNFAVOURABLE"
  | "UNKNOWN"
  | "SP"
  | null;

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

export type ContributionLinkedContent = {
  cdtnId: string;
};

export type ContributionRef = {
  url: string;
  title: string;
};

export type ContributionHighlight = {
  title?: string;
  content?: string;
  searchInfo?: string;
};

export type ContributionMessageBlock = {
  id: string;
  label: string;
  contentAgreement: string;
  contentAgreementWithoutLegal: string;
  contentLegal: string;
  contentNotHandled: string;
  contentNotHandledWithoutLegal: string;
};

export type ContributionAgreementMessage = {
  id: string;
  agreementId: string;
  content: string;
};
