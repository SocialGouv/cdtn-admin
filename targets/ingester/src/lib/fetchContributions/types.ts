import type { ContributionReference } from "@shared/types";

export type AgreementRaw = {
  idcc: string;
  name: string;
  parent_id: string;
};

export type AnswerRaw = {
  id: string;
  markdown: string;
  references: ContributionReference[];
  agreement: AgreementRaw | null;
};

export type AgreementAnswerRaw = AnswerRaw & {
  agreement: AgreementRaw;
};
export type QuestionRaw = {
  id: string;
  index: number;
  value: string;
  answers: AnswerRaw[];
};
