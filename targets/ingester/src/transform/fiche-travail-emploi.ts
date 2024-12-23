import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import type { FicheTravailEmploi } from "@socialgouv/fiches-travail-data-types";
import pMap from "p-map";

import { getJson } from "../lib/getJson";
import {
  articleToReference,
  createReferenceResolver,
} from "../lib/referenceResolver";
import { Code } from "@socialgouv/legi-data-types";

export default async function getFicheTravailEmploi(pkgName: string) {
  const [fichesMT, cdt] = await Promise.all([
    getJson<FicheTravailEmploi[]>(`${pkgName}/data/fiches-travail.json`),
    getJson<LegiData.Code>(
      `@socialgouv/legi-data/data/LEGITEXT000006072050.json`
    ),
  ]);
  const result = await pMap(
    fichesMT,
    async ({ pubId, sections, ...content }) => {
      const sectionsWithGlossary = await fetchSections(sections, cdt);
      return {
        id: pubId,
        ...content,
        is_searchable: true,
        sections: sectionsWithGlossary,
        slug: slugify(content.title),
        source: SOURCES.SHEET_MT_PAGE,
        /**
         * text is empty here because text used for search (in elasticsearch)
         * is in each sections and sections will be transform as searchable document
         */
        text: "",
      };
    },
    { concurrency: 1 }
  );

  return result;
}

const fetchSections = async (
  sections: FicheTravailEmploi["sections"],
  cdt: Code
) => {
  const resolveCdtReference = createReferenceResolver(cdt);

  return await pMap(
    sections,
    async ({ references, ...section }) => ({
      ...section,
      htmlWithGlossary: section.html,
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
    }),
    { concurrency: 1 }
  );
};
