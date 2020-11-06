import slugify from "@socialgouv/cdtn-slugify";
import cdtnSources from "@socialgouv/cdtn-sources";
import unistUtilSelect from "unist-util-select";

import { getJson } from "../lib/getJson.js";

const { SOURCES } = cdtnSources;
const { selectAll } = unistUtilSelect;

/**
 *
 * @param {string} pkgName
 * @returns {Promise<ingester.LegiArticle[]>}
 */
export default async function getCdtDocuments(pkgName) {
  /** @type {import("@socialgouv/legi-data-types").Code} */
  const cdt = await getJson(`${pkgName}/data/LEGITEXT000006072050.json`);

  const articles = /** @type {import("@socialgouv/legi-data-types").CodeArticle[]} */ (
    /** @type {any[]} */ (selectAll("article", cdt))
  );

  return articles.map(
    ({
      data: { id, cid, num, dateDebut, nota, notaHtml, texte, texteHtml },
    }) => ({
      dateDebut,
      description: texte.slice(0, texte.indexOf("…", 150)),
      html: texteHtml,
      id: cid,
      slug: slugify(fixArticleNum(cid, num)),
      source: SOURCES.CDT,
      text: `${texte}\n${nota}`,
      title: fixArticleNum(cid, num),
      ...(nota.length > 0 && { notaHtml }),
      url: getArticleUrl(id),
    })
  );
}
/**
 *
 * @param {string} id
 */
function getArticleUrl(id) {
  return `https://www.legifrance.gouv.fr/affichCodeArticle.do;?idArticle=${id}&cidTexte=LEGITEXT000006072050`;
}

/**
 * Some articles have a num wich is annexe
 * Since we use num as a slug to identify article,
 * we need to create a slug version
 * @param {string} id
 * @param {string} num
 */
function fixArticleNum(id, num) {
  if (num.match(/^annexe\s/i) && !num.includes("article")) {
    return `${num} ${id}`;
  }
  return num;
}
