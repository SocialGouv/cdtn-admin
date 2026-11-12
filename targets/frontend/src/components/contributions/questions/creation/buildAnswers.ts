import {
  AgreementRow,
  AgreementTypes,
  getEffectiveType,
} from "../common/agreementTypes";
import { LegiReference, OtherReference } from "../../type";
import { MutationResult } from "./question.mutation";

/**
 * Date du jour au format ISO (yyyy-MM-dd), format attendu par la colonne `display_date`
 * (un format jj/mm/aaaa serait mal interprété par Postgres).
 */
export const todayIso = (date: Date = new Date()): string => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

type Props = {
  agreements: AgreementRow[];
  types: AgreementTypes;
  genericIntroduction?: string;
  genericContent: string;
  genericLegiReferences?: LegiReference[];
  genericOtherReferences?: OtherReference[];
  template: string;
  displayDate: string;
  userId: string;
};

type Answers = Parameters<MutationResult>[0]["answers"]["data"];

/**
 * Réponses créées avec la question :
 * - générique (0000) : ANSWER avec l'introduction, la réponse et les références du Code du travail
 *   (articles et autres, pas de contenus liés), au statut « En rédaction » ;
 * - CC « Afficher la réponse » : copie du template ;
 * - autres types : aucun contenu (le contenu vient de la réponse générique), statut « À traiter » implicite.
 */
export const buildAnswers = ({
  agreements,
  types,
  genericIntroduction,
  genericContent,
  genericLegiReferences = [],
  genericOtherReferences = [],
  template,
  displayDate,
  userId,
}: Props): Answers => {
  const generic: Answers[number] = {
    display_date: displayDate,
    agreement_id: "0000",
    content_type: "ANSWER",
    content: genericContent,
    ...(genericIntroduction?.trim()
      ? { introduction: genericIntroduction }
      : {}),
    ...(genericLegiReferences.length > 0
      ? {
          legi_references: {
            data: genericLegiReferences.map((ref) => ({
              article_id: ref.legiArticle.id,
            })),
          },
        }
      : {}),
    ...(genericOtherReferences.length > 0
      ? {
          other_references: {
            data: genericOtherReferences.map((ref) => ({
              label: ref.label,
              url: ref.url || undefined,
            })),
          },
        }
      : {}),
    statuses: { data: [{ status: "REDACTING", user_id: userId }] },
  };
  const others = agreements.map((agreement): Answers[number] => {
    const type = getEffectiveType(agreement, types);
    if (!type) {
      throw new Error(
        `Aucun type de réponse n'est renseigné pour la CC ${agreement.id}`
      );
    }
    return {
      display_date: displayDate,
      agreement_id: agreement.id,
      content_type: type,
      ...(type === "ANSWER" && template ? { content: template } : {}),
    };
  });
  return [generic, ...others];
};
