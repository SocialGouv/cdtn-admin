import slugify from "@socialgouv/cdtn-slugify";
import cdtnSources from "@socialgouv/cdtn-sources";
import unistUtilSelect from "unist-util-select";

import { getJson } from "../lib/getJson";

const { SOURCES } = cdtnSources;
const { selectAll } = unistUtilSelect;

export default async function getCdtDocuments(pkgName: string) {
  const cdt = await getJson<LegiData.Code>(
    `${pkgName}/data/LEGITEXT000006072050.json`
  );

  const articles = selectAll("article", cdt) as LegiData.CodeArticle[];

  return articles.map(
    ({
      data: { id, cid, num, dateDebut, nota, notaHtml, texte, texteHtml },
    }) => ({
      dateDebut,
      description: texte.slice(0, texte.indexOf("…", 150)),
      html: texteHtml,
      id: cid,
      is_searchable: true,
      slug: slugify(fixArticleNum(cid, num)),
      source: SOURCES.CDT,
      text: `${texte}\n${nota}`,
      title: fixArticleNum(cid, num),
      ...(nota.length > 0 && { notaHtml }),
      url: getArticleUrl(id),
    })
  );
}

function getArticleUrl(id: string) {
  return `https://www.legifrance.gouv.fr/affichCodeArticle.do;?idArticle=${id}&cidTexte=LEGITEXT000006072050`;
}

/**
 * Some articles have a num wich is annexe
 * Since we use num as a slug to identify article,
 * we need to create a slug version
 */
function fixArticleNum(id: string, num: string) {
  if (num.match(/^annexe\s/i) && !num.includes("article")) {
    return `${num} ${id}`;
  }
  return num;
}
