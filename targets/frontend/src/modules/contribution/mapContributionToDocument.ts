import {
  ContributionDocumentJson,
  ContributionsAnswers,
  Document,
} from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { getReferences } from "./getReferences";
import { generateCdtnId } from "@shared/utils";
import { generateContributionSlug } from "./generateSlug";

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
    questionName: data.question.content,
    questionMessageId: data.question.message_id,
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
        type: "cdt",
        genericAnswerId: genericAnswer.id,
      };
    }
  } else if (data.content_type === "SP") {
    doc = {
      ...doc,
      type: "fiche-sp",
      ficheSpId: data.content_fiche_sp!.initial_id,
    };
  } else {
    throw new Error("Content type not defined");
  }
  return {
    cdtn_id: document?.cdtn_id ?? generateCdtnId(data.question.content),
    initial_id: data.id,
    source: SOURCES.CONTRIBUTIONS,
    meta_description: document?.meta_description ?? "", // la génération se fait à l'export car on a besoin du dernier contenu de la fiche sp
    title: document?.title ?? "", // on aurait pu le faire ici mais pour que ça soit cohérent autant le gérer à l'export
    text: document?.text ?? "", // la génération se fait à l'export car on a besoin du dernier contenu de la fiche sp
    slug:
      document?.slug ??
      generateContributionSlug(data.agreement.id, data.question.content),
    is_available: true,
    document: doc as ContributionDocumentJson,
  };
};
