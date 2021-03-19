import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import remark from "remark";
import html from "remark-html";

import { formatIdcc } from "../../lib/formatIdcc.js";
import { getJson } from "../../lib/getJson.js";
import { getAllKaliBlocks } from "./getKaliBlock.js";
import { getKaliArticlesByTheme } from "./kaliArticleBytheme.js";

const compiler = remark().use(html, { sanitize: true });

/**
 * @template A
 * @param {(a:A) => number} fn
 * @returns {(a:A, b:A) => number}
 */
export const createSorter = (fn) => (a, b) => fn(a) - fn(b);

/**
 *
 * @param {string} pkgName
 * @returns {Promise<ingester.AgreementPage[]>}
 */
export default async function getAgreementDocuments(pkgName) {
  /** @type {import("@socialgouv/kali-data-types").IndexedAgreement[]} */
  const agreements = await getJson(`${pkgName}/data/index.json`);

  /** @type {import("@socialgouv/contributions-data-types").Question[]} */
  const contributions = await getJson(
    `@socialgouv/contributions-data/data/contributions.json`
  );

  const allKaliBlocks = await getAllKaliBlocks();

  const contributionsWithSlug = contributions.map((contrib) => {
    const slug = slugify(contrib.title);
    return {
      ...contrib,
      slug,
    };
  });

  const agreementPages = [];

  for (const agreement of agreements) {
    const agreementTree = await getJson(
      `@socialgouv/kali-data/data/${agreement.id}.json`
    );
    agreementPages.push({
      ...getCCNInfo(agreement),
      answers: getContributionAnswers(contributionsWithSlug, agreement.num),
      articlesByTheme: getKaliArticlesByTheme(allKaliBlocks, agreementTree),
      description: `Idcc ${formatIdcc(agreement.num)} : ${
        agreement.shortTitle
      }`,
      is_searchable: true,
      source: SOURCES.CCN,
      synonymes: agreement.synonymes,
    });
  }
  return agreementPages.sort(createSorter(({ num }) => num));
}

/**
 * Get CCN general information
 * @param {import("@socialgouv/kali-data-types").IndexedAgreement} agreement
 */
function getCCNInfo({
  id,
  num,
  date_publi,
  effectif,
  mtime,
  title,
  shortTitle,
  url,
}) {
  return {
    date_publi,
    effectif,
    id,
    mtime,
    num,
    shortTitle,
    slug: slugify(`${num}-${shortTitle}`.substring(0, 80)),
    text: `IDCC ${num}: ${title} ${shortTitle}`,
    title,
    url,
  };
}

/**
 * Return contribution answer for a given idcc
 *
 * @param {(import("@socialgouv/contributions-data-types").Question & {slug: string})[]} contributionsWithSlug
 * @param {Number} agreementNum
 * @returns {ingester.AgreementAnswer[]}
 */
function getContributionAnswers(contributionsWithSlug, agreementNum) {
  return contributionsWithSlug
    .flatMap(({ title, slug, index, answers }) => {
      const [answer] = answers.conventions.filter(
        ({ idcc }) => parseInt(idcc, 10) === agreementNum
      );
      const unhandledRegexp = /La convention collective ne prévoit rien sur ce point/i;
      if (answer && !unhandledRegexp.test(answer.markdown)) {
        return [
          {
            answer: compiler.processSync(answer.markdown).contents.toString(),
            index,
            question: title.trim(),
            references: /** @type {import("@socialgouv/contributions-data-types").DilaRef[]} */ (answer.references),
            slug,
          },
        ];
      }
      return [];
    })
    .sort(createSorter((a) => a.index));
}
