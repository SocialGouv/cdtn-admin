import type { ContributionReference } from "@shared/types";

export interface AgreementRaw {
  id: string;
  name: string;
  parent_id: string; // en a-t-on besoin ?
}

export interface AnswerRaw {
  id: string;
  content: string;
  otherAnswer: string;
  kali_references: {
    title: string;
    article_id: string;
  }[];
  legi_references: ContributionReference[];
  cdtn_references: {
    title: string;
    slug: string;
  }[];
  other_references: ContributionReference[];
  agreement: AgreementRaw;
}

export interface QuestionRaw {
  id: string;
  index: number;
  title: string;
  answers: AnswerRaw[];
}
