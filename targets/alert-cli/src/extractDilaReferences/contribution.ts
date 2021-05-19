import { SOURCES } from "@socialgouv/cdtn-sources";

import { getAllDocumentsBySource } from "./getAllDocumentsBySource";

let references: alerts.DocumentReferences[];

/**
 * @param {import("@shared/types").ContributionDocument[]} questions
 */
export function extractContributionsRef(
  questions: import("@shared/types").ContributionComplete
) {
  /** @type {} */
  const references: alerts.DocumentReferences[] = [];

  for (const question of questions) {
    references.push({
      document: {
        id: question.id,
        source: SOURCES.CONTRIBUTIONS,
        title: question.title,
      },
      references: question.document.answers.generic.references,
    });
    if (
      !Object.prototype.hasOwnProperty.call(
        question.document.answers,
        "conventions"
      )
    ) {
      continue;
    }
    if (!isMultiConventionAnswer(question.document)) {
      continue;
    }
    question.document.answers.conventions.forEach((answer) =>
      references.push({
        document: {
          id: answer.id,
          source: SOURCES.CONTRIBUTIONS,
          title: question.title,
        },
        references: answer.references,
      })
    );
  }
  return references;
}

/**
 *  This is only to fool TS compiler
 * @param {import("@shared/types").CCMultipleAnswers | import("@shared/types").CCSingleAnswer} a
 * @returns {a is import("@shared/types").CCMultipleAnswers}
 */
function isMultiConventionAnswer(a) {
  return "conventions" in a.answers;
}

export default async function main() {
  if (!references) {
    /** @type {import("@shared/types").ContributionDocument[]} */
    const contributions = await getAllDocumentsBySource(SOURCES.CONTRIBUTIONS);
    references = extractContributionsRef(contributions);
  }
  return references;
}
