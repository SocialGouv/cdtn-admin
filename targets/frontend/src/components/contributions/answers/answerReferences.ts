import { Answer } from "../type";
import { AnswerForm } from "./Answer";

export const defaultReferences = (answer: Answer | undefined) => {
  return {
    kaliReferences:
      answer?.kali_references?.map((item) => {
        return Object.assign({}, item.kali_article, { label: item.label });
      }) ?? [],
    legiReferences:
      answer?.legi_references?.map((item) => item.legi_article) ?? [],
    cdtnReferences: answer?.cdtn_references?.map((item) => item.document) ?? [],
    otherReferences: answer?.other_references ?? [],
  };
};

export const formatKaliReferences = (answer: Answer, data: AnswerForm) => {
  return data.kaliReferences.map((ref) => ({
    answer_id: answer.id,
    article_id: ref.id,
    label: ref.label,
  }));
};
export const formatLegiReferences = (answer: Answer, data: AnswerForm) => {
  return data.legiReferences.map((ref) => ({
    answer_id: answer.id,
    article_id: ref.id,
  }));
};

export const formatCdtnReferences = (answer: Answer, data: AnswerForm) => {
  return data.cdtnReferences.map((ref) => ({
    answer_id: answer.id,
    cdtn_id: ref.cdtn_id,
  }));
};

export const formatOtherReferences = (answer: Answer, data: AnswerForm) => {
  return data.otherReferences.map((ref) => ({
    answer_id: answer.id,
    label: ref.label,
    url: ref.url,
  }));
};
