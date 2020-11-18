import { client } from "@shared/graphql-client";
import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
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

const getKaliBlocksQuery = `
query Blocks($id: String!) {
  kali_blocks_by_pk(id: $id) {blocks}
}
`;

/**
 *
 * @param {string} id
 * @returns {Promise<ingester.AgreementKaliBlocks>}
 */
async function getKaliBlocks(id) {
  const result = await client.query(getKaliBlocksQuery, { id }).toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error(`error initializing documents availability`);
  }
  return result.data.kali_blocks_by_pk && result.data.kali_blocks_by_pk.blocks;
}

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

  const contributionsWithSlug = contributions.map((contrib) => {
    const slug = slugify(contrib.title);
    return {
      ...contrib,
      slug,
    };
  });

  const agreementPages = [];

  // build agreement documents from kali-data, contributions, and cdtn-admin/kali_blocks
  for (const agreement of agreements) {
    const agreementTree = await getJson(
      `@socialgouv/kali-data/data/${agreement.id}.json`
    );
    const agreementBlocks = await getKaliBlocks(agreement.id);
    agreementPages.push({
      ...getCCNInfo(agreement),
      answers: getContributionAnswers(contributionsWithSlug, agreement.num),
      articlesByTheme: agreementBlocks
        ? getArticleByBlock(agreementBlocks, agreementTree)
        : [],
      description: `Idcc ${formatIdcc(agreement.num)} : ${
        agreement.shortTitle
      }`,
      source: SOURCES.CCN,
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

/**
 * @param {ingester.AgreementKaliBlocks} blocks
 * @param {import("@socialgouv/kali-data-types").Agreement} agreementTree
 * @returns {ingester.AgreementArticleByBlock[]}
 */
function getArticleByBlock(blocks, agreementTree) {
  const treeWithParents = parents(agreementTree);
  return Object.keys(blocks)
    .filter((key) => blocks[key].length > 0)
    .sort(createSorter((a) => parseInt(a, 10)))
    .map((key) => ({
      articles:
        blocks[key] &&
        blocks[key].flatMap((articleId) => {
          const node = find(
            treeWithParents,
            (node) => node.data.id === articleId
          );
          // if (!node) {
          //   console.debug(
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
      bloc: key,
    }))
    .filter(({ articles }) => articles.length > 0);
}
