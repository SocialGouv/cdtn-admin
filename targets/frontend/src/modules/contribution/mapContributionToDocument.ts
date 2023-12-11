import {
  ContributionDocumentJson,
  ContributionsAnswers,
  Document,
} from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { getReferences } from "./getReferences";
import { generateCdtnId } from "@shared/utils";
import { generateContributionSlug } from "./generateSlug";

async function getBaseDocument(
  data: ContributionsAnswers,
  fetchGenericAnswer: (
    questionId: string
  ) => Promise<Partial<ContributionsAnswers>>
) {
  switch (data.content_type) {
    case "ANSWER":
      return {
        type: "content",
        content: data.content!,
      };
    case "GENERIC_NO_CDT":
      return {
        type: "generic-no-cdt",
        messageBlockGenericNoCDT: data.message_block_generic_no_CDT!,
      };
    case "CDT":
    case "NOTHING":
    case "UNFAVOURABLE":
      const genericAnswer = await fetchGenericAnswer(data.question.id);
      if (genericAnswer.content_type === "GENERIC_NO_CDT") {
        if (data.content_type === "CDT") {
          throw new Error(
            `La contribution [${data.question.order} - ${data.agreement.id}] ne peut pas être de type "Code du travail" parce que la générique n'a pas de réponse`
          );
        }
        return;
      } else {
        return {
          type: "cdt",
          genericAnswerId: genericAnswer.id!,
        };
      }

    case "SP":
      return {
        type: "fiche-sp",
        ficheSpId: data.content_fiche_sp!.initial_id,
      };

    case "UNKNOWN":
      return;
    default:
      throw new Error("Content type not defined");
  }
}

export const mapContributionToDocument = async (
  data: ContributionsAnswers,
  document: Document<ContributionDocumentJson> | undefined,
  fetchGenericAnswer: (
    questionId: string
  ) => Promise<Partial<ContributionsAnswers>>
): Promise<Document<ContributionDocumentJson> | undefined> => {
  const baseDoc = await getBaseDocument(data, fetchGenericAnswer);
  if (!baseDoc) return;

  const initalDoc: ContributionDocumentJson = {
    ...baseDoc,
    contentType: data.content_type,
    linkedContent: data.cdtn_references.map((v) => ({
      cdtnId: v.document.cdtn_id,
    })),
    references: getReferences(data),
    questionIndex: data.question.order,
    questionName: data.question.content,
    questionId: data.question.id,
    idcc: data.agreement.id,
  } as ContributionDocumentJson;

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
    document: initalDoc,
  };
};
