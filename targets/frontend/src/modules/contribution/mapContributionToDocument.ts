import {
  ContributionDocumentJson,
  ContributionsAnswers,
  HasuraDocument,
} from "@socialgouv/cdtn-types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { getReferences } from "./getReferences";
import { generateCdtnId } from "@shared/utils";
import { generateContributionSlug } from "./generateSlug";
import { getGlossaryContent } from "../common/getGlossaryContent";
import { format, parseISO } from "date-fns";

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
        content: data.content,
        contentWithGlossary: await getGlossaryContent(data.content ?? ""),
      };
    case "GENERIC_NO_CDT":
      return {
        type: "generic-no-cdt",
        messageBlockGenericNoCDT: data.message_block_generic_no_CDT,
      };
    case "CDT":
    case "NOTHING":
    case "UNFAVOURABLE":
      const genericAnswer = await fetchGenericAnswer(data.question.id);
      if (genericAnswer.content_type === "GENERIC_NO_CDT") {
        if (
          data.content_type === "CDT" ||
          data.content_type === "UNFAVOURABLE" ||
          data.content_type === "NOTHING"
        ) {
          throw new Error(
            `La contribution [${data.question.order} - ${data.agreement.id}] ne peut pas référencer une générique qui n'a pas de réponse`
          );
        }
        return;
      } else {
        return {
          type: "cdt",
          genericAnswerId: genericAnswer.id,
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
  document: HasuraDocument<ContributionDocumentJson> | undefined,
  fetchGenericAnswer: (
    questionId: string
  ) => Promise<Partial<ContributionsAnswers>>
): Promise<HasuraDocument<ContributionDocumentJson> | undefined> => {
  const baseDoc = await getBaseDocument(data, fetchGenericAnswer);
  if (!baseDoc) return;

  const initalDoc: ContributionDocumentJson = {
    ...baseDoc,
    date: format(parseISO(data.display_date), "dd/MM/yyyy"),
    contentType: data.content_type,
    linkedContent: data.cdtn_references.map((v) => ({
      cdtnId: v.cdtn_id!,
    })),
    references: getReferences(data),
    questionIndex: data.question.order,
    questionName: data.question.content,
    seoTitle: data.question.seo_title,
    questionId: data.question.id,
    idcc: data.agreement.id,
    description: data.description,
  } as ContributionDocumentJson;

  return {
    cdtn_id:
      document?.cdtn_id ?? generateCdtnId(SOURCES.CONTRIBUTIONS + data.id),
    initial_id: data.id,
    source: SOURCES.CONTRIBUTIONS,
    meta_description: document?.meta_description ?? "", // la génération se fait à l'export car on a besoin du dernier contenu de la fiche sp
    title: data.question.content, // même si généré à l'export, on set un title par défaut pour l'affichage dans l'admin (maj, publication...)
    text: document?.text ?? "", // la génération se fait à l'export car on a besoin du dernier contenu de la fiche sp
    slug:
      document?.slug ??
      generateContributionSlug(data.agreement.id, data.question.content),
    is_searchable:
      data.agreement.id === "0000" ? document?.is_searchable ?? true : false,
    is_published: document?.is_published ?? true,
    is_available: true,
    document: initalDoc,
  };
};
