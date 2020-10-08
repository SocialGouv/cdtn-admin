import slugify from "@socialgouv/cdtn-slugify";
import contributions from "@socialgouv/contributions-data/data/contributions.json";
import agreementsBlocks from "@socialgouv/datafiller-data/data/agreements.json";
import kaliData from "@socialgouv/kali-data/data/index.json";
import remark from "remark";
import html from "remark-html";
import find from "unist-util-find";
import parents from "unist-util-parents";

const compiler = remark().use(html, { sanitize: true });
const createSorter = (fn = (a) => a) => (a, b) => fn(a) - fn(b);

const contributionsWithSlug = contributions.map((contrib) => {
  const slug = slugify(contrib.title);
  return {
    ...contrib,
    slug,
  };
});

function getAgreementPages() {
  return kaliData
    .sort(createSorter(({ num }) => parseInt(num, 10)))
    .map((agreement) => {
      const agreementTree = require(`@socialgouv/kali-data/data/${agreement.id}.json`);
      const blocksData = agreementsBlocks.find(
        // cid = container-id not chronical-id
        (data) => data.cid === agreement.id
      );
      return {
        ...getCCNInfo(agreement),
        answers: getContributionAnswers(agreement.num),
        articlesByTheme:
          blocksData && blocksData.groups
            ? getArticleByBlock(blocksData.groups, agreementTree)
            : [],
        nbTextes: getNbText(agreementTree),
      };
    });
}

/**
 * Get CCn geenral information
 * @param {Object} agreement
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
 * Get CCn detailed informations about articles and texts
 */
function getNbText(agreementTree) {
  const texteDeBase = find(agreementTree, (node) =>
    node.data.title.startsWith("Texte de base")
  );
  if (!texteDeBase) {
    return;
  }

  return texteDeBase.children.length;
}

/**
 * Return contribution answer for a given idcc
 * param {agreementNum} string
 */
function getContributionAnswers(agreementNum) {
  const transformRef = ({ title, url, category, agreement }) => {
    return {
      category: category,
      title,
      url: url || (agreement && agreement.url),
    };
  };
  return contributionsWithSlug
    .map(({ title, slug, index, answers }) => {
      const [answer] = answers.conventions.filter(
        ({ idcc }) => parseInt(idcc) === parseInt(agreementNum)
      );
      const unhandledRegexp = /La convention collective ne prévoit rien sur ce point/i;
      if (answer && !unhandledRegexp.test(answer.markdown)) {
        const rootTheme = null;

        return {
          answer: compiler.processSync(answer.markdown).contents,
          index,
          question: title.trim(),
          references: answer.references.map(transformRef),
          slug,
          theme: rootTheme,
        };
      }
    })
    .sort(createSorter((a) => a.index))
    .filter(Boolean);
}

/**
 * @param {id:<String>, selection:<String[]>}
 * @param {Object} agreementTree
 */
function getArticleByBlock(groups, agreementTree) {
  const treeWithParents = parents(agreementTree);
  return groups
    .filter(({ selection }) => selection.length > 0)
    .sort(createSorter((a) => a.id))
    .map(({ id, selection }) => ({
      articles: selection
        .map((articleId) => {
          const node = find(
            treeWithParents,
            (node) => node.data.id === articleId
          );
          if (!node) {
            console.error(
              `${articleId} not found in idcc ${agreementTree.data.num}`
            );
          }
          return node
            ? {
                cid: node.data.cid,
                id: node.data.id,
                section: node.parent.data.title,
                title: node.data.num || "non numéroté",
              }
            : null;
        })
        .filter(Boolean),
      bloc: id,
    }))
    .filter(({ articles }) => articles.length > 0);
}

if (require.main === module) {
  const data = getAgreementPages();
  console.log(JSON.stringify(data, null, 2));
}

export { getAgreementPages };
