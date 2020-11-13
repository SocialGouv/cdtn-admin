import { SOURCES } from "@socialgouv/cdtn-sources";

import { getAllDocumentsBySource } from "./getAllDocumentsBySource";

/** @type {alerts.DocumentReferences[]} */
let references;

/**
 * @param {import("@shared/types").ContributionDocument[]} questions
 */
export function extractContributionsRef(questions) {
  /** @type {alerts.DocumentReferences[]} */
  const references = [];

  for (const question of questions) {
    references.push({
      document: {
        id: question.id,
        source: SOURCES.CONTRIBUTIONS,
        title: question.title,
      },
      references: question.document.answers.generic.references,
    });

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

export default async function main() {
  if (!references) {
    /** @type {import("@shared/types").ContributionDocument[]} */
    const contributions = await getAllDocumentsBySource(SOURCES.CONTRIBUTIONS);
    references = extractContributionsRef(contributions);
  }
  return references;
}
