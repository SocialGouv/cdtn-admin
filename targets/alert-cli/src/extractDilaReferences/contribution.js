import contributions from "@socialgouv/contributions-data/data/contributions.json";
import { SOURCES } from "@socialgouv/cdtn-sources";

/**
 * @param {import("@socialgouv/contributions-data").Question[]} questions
 */
export function extractContributionsRef(questions) {
  /** @type {alerts.DocumentReferences[]} */
  const references = [];

  for (const question of questions) {
    references.push({
      document: {
        id: question.id,
        title: question.title,
        type: SOURCES.CONTRIBUTIONS,
      },
      references: /** @type {import("@socialgouv/contributions-data").DilaRef} */ /** @type {any} */ (question.answers.generic.references.flatMap(
        getDilaRef
      )),
    });

    question.answers.conventions.forEach((answer) =>
      references.push({
        document: {
          id: question.id,
          title: question.title,
          type: SOURCES.CONTRIBUTIONS,
          idcc: answer.idcc,
        },
        references: /** @type {import("@socialgouv/contributions-data").DilaRef} */ /** @type {any} */ (answer.references.flatMap(
          getDilaRef
        )),
      })
    );
  }
  return references;
}

/**
 *
 * @param {import("@socialgouv/contributions-data").Reference} reference
 */
function getDilaRef(reference) {
  if (reference.category === null) {
    return [];
  }
  return {
    category: reference.category,
    title: reference.title,
    dila_id: reference.dila_id,
    dila_cid: reference.dila_cid,
    dila_container_id: reference.dila_container_id,
  };
}

export default function main() {
  return extractContributionsRef(
    /** @type {import("@socialgouv/contributions-data").Question[]} */ /** @type {any} */ (contributions)
  );
}
