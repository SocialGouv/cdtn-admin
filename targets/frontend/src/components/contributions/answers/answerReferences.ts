import {
  KaliReference,
  LegiReference,
  CdtnReference,
  OtherReference,
  Document,
} from "../type";

export const formatKaliReferences = (
  answerId: string,
  refs: KaliReference[]
) => {
  return refs.map((ref) => ({
    answer_id: answerId,
    article_id: ref.kaliArticle.id,
    label: ref.label,
  }));
};
export const formatLegiReferences = (
  answerId: string,
  refs: LegiReference[]
) => {
  return refs.map((ref) => ({
    answer_id: answerId,
    article_id: ref.legiArticle.id,
  }));
};

export const formatCdtnReferences = (
  answerId: string,
  refs: CdtnReference[]
) => {
  return refs.map((ref) => ({
    answer_id: answerId,
    cdtn_id: ref.document.cdtnId,
  }));
};

export const formatOtherReferences = (
  answerId: string,
  refs: OtherReference[]
) => {
  return refs.map((ref) => ({
    answer_id: answerId,
    label: ref.label,
    url: ref.url,
  }));
};
