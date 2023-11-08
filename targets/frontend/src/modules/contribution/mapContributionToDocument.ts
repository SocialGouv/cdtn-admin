import { ContributionDocumentJson, ContributionsAnswers } from "@shared/types";
import { Document } from "../documents/type";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { getReferences } from "./getReferences";

export const mapContributionToDocument = async (
  data: ContributionsAnswers,
  document: Document<ContributionDocumentJson>,
  fetchGenericAnswer: (
    questionId: string
  ) => Promise<Partial<ContributionsAnswers>>
): Document<ContributionDocumentJson> => {
  let doc: Partial<ContributionDocumentJson> = {
    contentType: data.content_type,
    linkedContent: data.cdtn_references,
    references: getReferences(data),
  };

  if (data.content_type === "ANSWER") {
    doc = {
      ...doc,
      content: data.content!,
    };
  } else if (
    data.content_type === "CDT" ||
    data.content_type === "NOTHING" ||
    data.content_type === "UNFAVOURABLE" ||
    data.content_type === "UNKNOWN"
  ) {
    const genericAnswer = await fetchGenericAnswer(data.question.id);
    if (genericAnswer.content_type === "SP") {
      doc = {
        ...doc,
        raw: genericAnswer.content_fiche_sp!.document.raw,
        date: genericAnswer.content_fiche_sp!.document.date,
        url: genericAnswer.content_fiche_sp!.document.url,
      };
    } else {
      doc = {
        ...doc,
        content: genericAnswer.content!,
      };
    }
  } else if (data.content_type === "SP") {
    doc = {
      ...doc,
      raw: data.content_fiche_sp!.document.raw,
      date: data.content_fiche_sp!.document.date,
      url: data.content_fiche_sp!.document.url,
    };
  }

  return {
    cdtn_id: document.cdtn_id,
    initial_id: document.initial_id, // TODO: A voir si on le bouge ou pas
    source: SOURCES.CONTRIBUTIONS,
    meta_description: document.meta_description,
    title: document.title,
    text: document.text,
    slug: document.slug,
    is_available: true,
    document: doc,
  };
};
