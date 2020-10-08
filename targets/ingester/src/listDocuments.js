import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import find from "unist-util-find";
import { selectAll } from "unist-util-select";

import { getAgreementPages } from "./agreementPages";
import { getFichesServicePublic } from "./fichesServicePublic";
import { getVersions } from "./getSocialgouvVersions";
import { logger } from "./logger";

function parseIdcc(idcc) {
  return parseInt(idcc, 10);
}
function getArticleUrl(id) {
  return `https://www.legifrance.gouv.fr/affichCodeArticle.do;?idArticle=${id}&cidTexte=LEGITEXT000006072050`;
}

function fixArticleNum(id, num) {
  if (num.match(/^annexe\s/i) && !num.includes("article")) {
    return `${num} ${id}`;
  }
  return num;
}

/**
 * Find duplicate slugs
 * @param {AsyncIterable<(ingester.CdtnDocument)[]>} allDocuments is an iterable generator
 */
async function getDuplicateSlugs(allDocuments) {
  /** @type {string[]} */
  let slugs = [];
  for await (const documents of allDocuments) {
    slugs = slugs.concat(
      documents.map(({ source, slug }) => `${source}/${slug}`)
    );
  }

  return slugs
    .map((slug) => ({ count: slugs.filter((s) => slug === s).length, slug }))
    .filter(({ count }) => count > 1)
    .reduce((state, { slug, count }) => ({ ...state, [slug]: count }), {});
}
/**
 * @returns {AsyncIterable<ingester.CdtnDocument[]>}
 */
async function* cdtnDocumentsGen() {
  const fichesMT = require("@socialgouv/fiches-travail-data/data/fiches-travail.json");
  fichesMT.forEach((article) => (article.slug = slugify(article.title)));

  logger.info("=== Code du travail ===");
  yield selectAll(
    "article",
    require("@socialgouv/legi-data/data/LEGITEXT000006072050.json")
  ).map(
    ({ data: { id, num, dateDebut, nota, notaHtml, texte, texteHtml } }) => ({
      dateDebut,
      description: texte.slice(0, texte.indexOf("…", 150)),
      html: texteHtml,
      id,
      slug: slugify(fixArticleNum(id, num)),
      source: SOURCES.CDT,
      text: `${texte}\n${nota}`,
      title: fixArticleNum(id, num),
      ...(nota.length > 0 && { notaHtml }),
      url: getArticleUrl(id),
    })
  );

  logger.info("=== Fiches SP ===");
  yield getFichesServicePublic();

  logger.info("=== Contributions ===");
  yield require("@socialgouv/contributions-data/data/contributions.json").map(
    ({ title, answers, id }) => {
      const slug = slugify(title);
      fixReferences(answers.generic);
      answers.conventions.forEach(fixReferences);

      return {
        answers: {
          ...answers,
          generic: {
            ...answers.generic,
            markdown: answers.generic.markdown,
          },
        },
        description: (answers.generic && answers.generic.description) || title,
        excludeFromSearch: false,
        id,
        slug,
        source: SOURCES.CONTRIBUTIONS,
        text: (answers.generic && answers.generic.text) || title,
        title,
      };
    }
  );

  logger.info("=== page fiches travail-emploi ===");
  yield fichesMT.map(({ pubId, ...content }) => {
    return {
      id: pubId,
      ...content,

      source: SOURCES.SHEET_MT_PAGE,
      /**
       * text is empty here because text used for search (in elasticsearch)
       * is in each sections and sections will be transform as searchable document
       */
      text: "",
    };
  });

  logger.info("=== page Convention collective ===");
  const ccnData = getAgreementPages();
  yield ccnData.map(({ ...content }) => {
    return {
      ...content,
      source: SOURCES.CCN_PAGE,
    };
  });
}

/**
 * HACK @lionelb
 * fix references is here only until migration of references in contributions
 * will be done.
 * fixReferences will resolve article num.
 * For article withou num, it will use the parent section's name
 */
function fixReferences({ references = [], idcc = "generic" }) {
  references.forEach((ref) => {
    if (ref.title.startsWith("KALIARTI")) {
      const tree = require(`@socialgouv/kali-data/data/${ref.agreement.id}.json`);
      const parent = find(tree, (node) => {
        return (
          node.type === "section" &&
          node.children.some((node) => node.data.id === ref.title)
        );
      });
      if (parent) {
        const node = parent.children.find((node) => node.data.id === ref.title);
        ref.id = ref.title;
        ref.title = node.data.num
          ? `Article ${node.data.num}`
          : parent.data.title;
        if (!ref.title) {
          console.error("article with no num", ref.id, ref.agreement.id, idcc);
        }
      } else {
        console.error("can't fix ref for", ref.title, ref.agreement.id, idcc);
      }
    }
  });
}

export { getDuplicateSlugs, cdtnDocumentsGen };
