import contributions from "@socialgouv/contributions-data/data/contributions.json";

/**
 * @param {import("@socialgouv/contributions-data").Question[]} questions
 */
export function extractContributionsRef(questions) {
  /** @type {alerts.DocumentReference[]} */
  const references = [];

  for (const question of questions) {
    references.push({
      document: {
        id: question.id,
        title: question.title,
        type: "contribution",
      },
      references: question.answers.generic.references,
    });

    question.answers.conventions.forEach((answer) =>
      references.push({
        document: {
          id: question.id,
          title: question.title,
          type: "contribution",
          idcc: answer.idcc,
        },
        references: answer.references,
      })
    );
  }
  return references;
}

/**
 * @param {alerts.Changes} changes
 */
export function getRelevantDocuments({ modified, removed }) {
  const contributionsReferences = extractContributionsRef(
    /** @type {import("@socialgouv/contributions-data").Question[]} */ /** @type {any} */ (contributions)
  );
  const documents = contributionsReferences.flatMap((item) => {
    const reference = item.references.find(
      (ref) =>
        modified.find(
          (node) =>
            node.data.id === ref.dila_id || node.data.cid === ref.dila_cid
        ) ||
        removed.find(
          (node) =>
            node.data.id === ref.dila_id || node.data.cid === ref.dila_cid
        )
    );
    if (reference) {
      return { document: item.document, reference };
    }
    return [];
  });
  return documents;
}
