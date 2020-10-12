import slugify from "@socialgouv/cdtn-slugify";
import cdtnSources from "@socialgouv/cdtn-sources";
import remark from "remark";
import html from "remark-html";
import find from "unist-util-find";
import parents from "unist-util-parents";

import { formatIdcc } from "../lib/formatIdcc.js";
import { getJson } from "../lib/getJson.js";

const compiler = remark().use(html, { sanitize: true });
/**
 * @template A
 * @param {(a:A) => number} fn
 * @returns {(a:A, b:A) => number}
 */
const createSorter = (fn) => (a, b) => fn(a) - fn(b);

const { SOURCES } = cdtnSources;

/**
 *
 * @param {string} pkgName
 * @returns {Promise<ingester.AgreementPage[]>}
 */
export default async function getAgreementDocuments(pkgName) {
  /** @type {import("@socialgouv/kali-data").IndexedAgreement[]} */
  const agreements = await getJson(`${pkgName}/data/index.json`);

  /** @type {import("@socialgouv/contributions-data").Question[]} */
  const contributions = await getJson(
    `@socialgouv/contributions-data/data/contributions.json`
  );

  /** @type {import("@socialgouv/datafiller-data").AgreementsItem[]} */
  const agreementsBlocks = await getJson(
    "@socialgouv/datafiller-data/data/agreements.json"
  );

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
    const blocksData = agreementsBlocks.find(
      // cid = container-id not chronical-id
      (data) => data.cid === agreement.id
    );
    agreementPages.push({
      ...getCCNInfo(agreement),
      answers: getContributionAnswers(contributionsWithSlug, agreement.num),
      articlesByTheme:
        blocksData && blocksData.groups
          ? getArticleByBlock(blocksData.groups, agreementTree)
          : [],
      description: `Idcc ${formatIdcc(agreement.num)} : ${
        agreement.shortTitle
      }`,
      source: SOURCES.CCN_PAGE,
    });
  }
  return agreementPages.sort(createSorter(({ num }) => num));
}

/**
 * Get CCn geenral information
 * @param {import("@socialgouv/kali-data").IndexedAgreement} agreement
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
 * @param {(import("@socialgouv/contributions-data").Question & {slug: string})[]} contributionsWithSlug
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
            references: /** @type {import("@socialgouv/contributions-data").DilaRef[]} */ (answer.references),
            slug,
          },
        ];
      }
      return [];
    })
    .sort(createSorter((a) => a.index));
}

/**
 * @param {{id:string, selection:string[]}[]} groups
 * @param {import("@socialgouv/kali-data").Agreement} agreementTree
 * @returns {ingester.AgreementArticleByBlock[]}
 */
function getArticleByBlock(groups, agreementTree) {
  const treeWithParents = parents(agreementTree);
  return groups
    .filter(({ selection }) => selection.length > 0)
    .sort(createSorter((a) => parseInt(a.id, 10)))
    .map(({ id, selection }) => ({
      articles: selection.flatMap((articleId) => {
        const node = find(
          treeWithParents,
          (node) => node.data.id === articleId
        );
        // if (!node) {
        //   console.error(
        //     `${articleId} not found in idcc ${agreementTree.data.num}`
        //   );
        // }
        return node
          ? [
              {
                cid: node.data.cid,
                id: node.data.id,
                section: node.parent.data.title,
                title: node.data.num || "non numéroté",
              },
            ]
          : [];
      }),
      bloc: id,
    }))
    .filter(({ articles }) => articles.length > 0);
}
