import {
  CdtnRelatedContent,
  FicheServicePublicDoc,
  LegalRef,
} from "@shared/types";

export interface AgreementRaw {
  id: string;
  name: string;
}

export interface AnswerRaw {
  id: string;
  content: string;
  document?: { ficheSPDocument: FicheServicePublicDoc };
  contentType: string;
  kali_references: {
    title: string;
    kali_article: {
      article_id: string;
    };
  }[];
  legi_references: {
    legi_article: {
      title: string;
    };
  }[];
  cdtn_references: CdtnRelatedContent[];
  other_references: LegalRef[];
  agreement: AgreementRaw;
}

export interface QuestionRaw {
  id: string;
  order: number;
  content: string;
  answers: AnswerRaw[];
}
