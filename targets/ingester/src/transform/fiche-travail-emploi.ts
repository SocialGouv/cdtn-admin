import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { FicheTravailEmploi } from "@socialgouv/fiches-travail-data-types";

import { getJson } from "../lib/getJson";
import {
  articleToReference,
  createReferenceResolver,
} from "../lib/referenceResolver";

export default async function getFicheTravailEmploi(pkgName: string) {
  const [fichesMT, cdt] = await Promise.all([
    getJson<FicheTravailEmploi[]>(`${pkgName}/data/fiches-travail.json`),
    getJson<LegiData.Code>(
      `@socialgouv/legi-data/data/LEGITEXT000006072050.json`
    ),
  ]);
  const resolveCdtReference = createReferenceResolver(cdt);
  return fichesMT.map(({ pubId, sections, ...content }) => {
    return {
      id: pubId,
      ...content,
      is_searchable: true,
      sections: sections.map(({ references, ...section }) => ({
        ...section,
        references: Object.keys(references).flatMap((key) => {
          if (key !== "LEGITEXT000006072050") {
            return [];
          }
          const { articles } = references[key];
          return articles.flatMap(({ id }) => {
            const [article] = resolveCdtReference(id) as LegiData.CodeArticle[];
            if (!article) {
              return [];
            }
            return articleToReference(article);
          });
        }),
      })),
      slug: slugify(content.title),
      source: SOURCES.SHEET_MT_PAGE,
      /**
       * text is empty here because text used for search (in elasticsearch)
       * is in each sections and sections will be transform as searchable document
       */
      text: "",
    };
  });
}
