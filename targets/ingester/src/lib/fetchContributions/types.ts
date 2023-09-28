import { BaseRef, ExternalRef, FicheServicePublicDoc } from "@shared/types";

export interface AgreementRaw {
  id: string;
  name: string;
  parent_id: string; // en a-t-on besoin ?
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
  cdtn_references: BaseRef[];
  other_references: ExternalRef[];
  agreement: AgreementRaw;
}

export interface QuestionRaw {
  id: string;
  order: number;
  content: string;
  answers: AnswerRaw[];
}
