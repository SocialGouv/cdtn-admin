import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import type { FicheTravailEmploi } from "@socialgouv/fiches-travail-data-types";
import { fetch } from "undici";

import { getJson } from "../lib/getJson";
import {
  articleToReference,
  createReferenceResolver,
} from "../lib/referenceResolver";

const URL_EXPORT = process.env.URL_EXPORT || "http://localhost:8787";

export default async function getFicheTravailEmploi(pkgName: string) {
  const [fichesMT, cdt] = await Promise.all([
    getJson<FicheTravailEmploi[]>(`${pkgName}/data/fiches-travail.json`),
    getJson<LegiData.Code>(
      `@socialgouv/legi-data/data/LEGITEXT000006072050.json`
    ),
  ]);
  const resolveCdtReference = createReferenceResolver(cdt);
  const result = await Promise.all(
    fichesMT.map(async ({ pubId, sections, ...content }) => {
      return {
        id: pubId,
        ...content,
        is_searchable: true,
        sections: await Promise.all(
          sections.map(async ({ references, ...section }) => {
            const resultProcess: any = await fetch(URL_EXPORT + "/glossary", {
              body: JSON.stringify({
                type: "html",
                content: section.html,
              }),
              headers: {
                "Content-Type": "application/json",
              },
              method: "POST",
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(
                    `HTTP error on glossary! status: ${response.status}`
                  );
                }
                return response.json();
              })
              .catch((error) => {
                throw new Error(`Error on glossary! ${error}`);
              });
            const htmlWithGlossary = resultProcess.result;

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
