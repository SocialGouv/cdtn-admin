import { SOURCES } from "@socialgouv/cdtn-sources";
import fiches from "@socialgouv/fiches-travail-data/data/fiches-travail.json";

/**
 *
 * @param {import("@socialgouv/fiches-travail-data").FicheTravailEmploi[]} fiches
 */
export function extractFicheTravailEmploiRef(fiches) {
  /** @type {alerts.DocumentReferences[]} */
  const references = [];

  for (const fiche of fiches) {
    fiche.sections.forEach((section) => {
      const sectionRef = Object.entries(section.references).flatMap(
        ([codeId, { name, articles }]) => {
          if (name === "code du travail") {
            return articles.map((ref) => ({
              category: "labor_code",
              dila_cid: ref.cid,
              dila_container_id: codeId,
              dila_id: ref.id,
              title: ref.fmt,
            }));
          }
          return [];
        }
      );
      references.push({
        document: {
          id: fiche.pubId,
          title: `${fiche.title}#${section.anchor}`,
          type: SOURCES.SHEET_MT,
        },
        references: sectionRef,
      });
    });
  }
  return references;
}

export default function main() {
  return extractFicheTravailEmploiRef(
    /** @type {import("@socialgouv/fiches-travail-data").FicheTravailEmploi[]} */ (fiches)
  );
}
