import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import type { FicheTravailEmploi } from "@socialgouv/fiches-travail-data-types";

import { getJson } from "../lib/getJson";
import {
  articleToReference,
  createReferenceResolver,
} from "../lib/referenceResolver";
import { addGlossaryContentWorker, fetchGlossary } from "@shared/utils";

export default async function getFicheTravailEmploi(pkgName: string) {
  const [fichesMT, cdt] = await Promise.all([
    getJson<FicheTravailEmploi[]>(`${pkgName}/data/fiches-travail.json`),
    getJson<LegiData.Code>(
      `@socialgouv/legi-data/data/LEGITEXT000006072050.json`
    ),
  ]);
  const glossary = await fetchGlossary();
  const resolveCdtReference = createReferenceResolver(cdt);
  const result = await Promise.all(
    fichesMT.map(async ({ pubId, sections, ...content }) => {
      return {
        id: pubId,
        ...content,
        is_searchable: true,
        sections: await Promise.all(
          sections.map(async ({ references, ...section }) => {
            const htmlWithGlossary = await addGlossaryContentWorker({
              glossary,
              type: "html",
              content: section.html,
            });
            return {
              ...section,
              htmlWithGlossary,
              references: Object.keys(references).flatMap((key) => {
                if (key !== "LEGITEXT000006072050") {
                  return [];
                }
                const { articles } = references[key];
                return articles.flatMap(({ id }) => {
                  const maybeArticle = resolveCdtReference(
                    id
                  ) as LegiData.CodeArticle[];
                  if (maybeArticle.length !== 1) {
                    return [];
                  }
                  return articleToReference(maybeArticle[0]);
                });
              }),
            };
          })
        ),
        slug: slugify(content.title),
        source: SOURCES.SHEET_MT_PAGE,
        /**
         * text is empty here because text used for search (in elasticsearch)
         * is in each sections and sections will be transform as searchable document
         */
        text: "",
      };
    })
  );
  return result;
}
