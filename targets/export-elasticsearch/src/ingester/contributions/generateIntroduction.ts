import {
  ContributionContent,
  ContributionContentType,
} from "@socialgouv/cdtn-types";
import {
  ContributionVariableValues,
  hasHighlight,
  replaceContributionVariables,
} from "@shared/utils";
import { QuestionIntroductions } from "./fetchQuestionIntroductions";

/**
 * Introduction à afficher avant la réponse pour une contribution :
 * uniquement pour les types NOTHING et CDT, et si elle est renseignée.
 */
export const selectIntroduction = (
  contentType: ContributionContentType,
  introductions: QuestionIntroductions | undefined
): string | undefined => {
  if (!introductions) {
    return undefined;
  }
  let introduction: string | null;
  if (contentType === "NOTHING") {
    introduction = introductions.introduction_nothing;
  } else if (contentType === "CDT") {
    introduction = introductions.introduction_cdt;
  } else {
    return undefined;
  }
  return introduction && introduction.trim() !== "" ? introduction : undefined;
};

const assertNoHighlight = (html: string, label: string, where: string) => {
  if (hasHighlight(html)) {
    throw new Error(
      `${label} : le contenu (${where}) contient du texte surligné, il ne peut pas être publié.`
    );
  }
};

/**
 * Remplace les variables par leurs valeurs et vérifie l'absence de surlignage.
 * Lève une erreur (donc bloque l'export) en cas de variable inconnue
 * ou de surlignage résiduel.
 */
export const resolveHtml = (
  html: string,
  values: ContributionVariableValues,
  label: string,
  where: string
): string => {
  let resolved: string;
  try {
    resolved = replaceContributionVariables(html, values);
  } catch (e: any) {
    throw new Error(`${label} : ${e.message} (${where})`);
  }
  assertNoHighlight(resolved, label, where);
  return resolved;
};

export const resolveContentVariables = (
  content: ContributionContent,
  values: ContributionVariableValues,
  label: string
): ContributionContent => {
  if ("content" in content && typeof content.content === "string") {
    return {
      ...content,
      content: resolveHtml(content.content, values, label, "réponse"),
    };
  }
  return content;
};
