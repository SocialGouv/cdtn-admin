import { HasuraDocument, HasuraDocumentBase } from "./common";
import { FicheServicePublicDoc } from "./fiche-sp";

export type ContributionStatus = {
  createdAt: string;
  status: string;
};

export type ContributionsAnswers = {
  id: string;
  cdtnId: string | null;
  content: string | null;
  description: string | null;
  content_type: ContributionContentType;
  question: ContributionQuestion;
  kali_references: ContributionKaliReferences[];
  legi_references: ContributionLegiReferences[];
  other_references: ContributionOtherReferences[];
  cdtn_references: Partial<ContributionCdtnReferences>[];
  infographics: InfographicReference[];
  content_fiche_sp: ContributionContentFicheSp | null;
  message_block_generic_no_CDT: string | null;
  /** Introduction (HTML) de la réponse générique (0000) */
  introduction?: string | null;
  /** URL des références de la réponse générique choisies par une CC « Afficher la réponse » */
  selected_cdt_references?: { reference_url: string }[];
  agreement: ContributionAgreement;
  updatedAt: string;
  statuses?: ContributionStatus[];
  display_date: string;
  document?: HasuraDocumentBase | null;
};

export type ContributionQuestion = {
  id: string;
  content: string;
  order: number;
  seo_title?: string;
};

export type ContributionKaliReferences = {
  label: string;
  kali_article: ContributionKaliReferencesKaliArticle;
};

export type InfographicReference = {
  infographicId: string;
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

export type ContributionCdtnReferences = HasuraDocument<any>;

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
  infographics?: ContributionInfographic[];
  questionIndex: number;
  questionName: string;
  seoTitle?: string;
  questionId: string;
  description: string;
  idcc: string; // 0000 pour la générique, impossible d'être nulle
  date: string;
  /** Introduction affichée avant la réponse (réponse générique uniquement) */
  introduction?: string;
  /**
   * URL des références de la réponse générique à ajouter à cette CC (type « Afficher la réponse »).
   * Résolues à l'export contre les références du document de la réponse générique.
   */
  includedCdtReferences?: string[];
};

export type ContributionDocumentJsonContent = ContributionDocumentJsonBasic & {
  type: "content";
  content: string;
  contentWithGlossary: string;
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

export type ContributionInfographic = {
  infographicId: string;
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
