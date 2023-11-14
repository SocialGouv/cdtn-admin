import {
  ContributionDocumentJson,
  ContributionsAnswers,
  Document,
} from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { getReferences } from "./getReferences";
import slugify from "@socialgouv/cdtn-slugify";
import { generateCdtnId } from "@shared/utils";

export const mapContributionToDocument = async (
  data: ContributionsAnswers,
  document: Document<ContributionDocumentJson> | undefined,
  fetchGenericAnswer: (
    questionId: string
  ) => Promise<Partial<ContributionsAnswers>>
): Promise<Document<ContributionDocumentJson>> => {
  let doc: Partial<ContributionDocumentJson> = {
    contentType: data.content_type,
    linkedContent: data.cdtn_references.map((v) => v.document),
    references: getReferences(data),
    questionIndex: data.question.order,
    idcc: data.agreement.id,
  };

  if (data.content_type === "ANSWER") {
    doc = {
      ...doc,
      type: "content",
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
        type: "fiche-sp",
        ficheSpId: genericAnswer.content_fiche_sp!.initial_id,
      };
    } else {
      doc = {
        ...doc,
        type: "content",
        content: genericAnswer.content!,
      };
    }
  } else if (data.content_type === "SP") {
    doc = {
      ...doc,
      type: "fiche-sp",
      ficheSpId: data.content_fiche_sp!.initial_id,
    };
  }
  return {
    cdtn_id: document?.cdtn_id ?? generateCdtnId(data.question.content),
    initial_id: data.id,
    source: SOURCES.CONTRIBUTIONS,
    meta_description: document?.meta_description ?? "",
    title: data.question.content,
    text: document?.text ?? "",
    slug:
      document && document.slug
        ? document.slug
        : data.agreement.id !== "0000"
        ? slugify(`${parseInt(data.agreement.id, 10)}-${data.question.content}`)
        : slugify(data.question.content),
    is_available: true,
    document: doc as ContributionDocumentJson,
  };
};
