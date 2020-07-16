import parents from "unist-util-parents";
import { selectAll } from "unist-util-select";

/**
 * @param {import("src").DilaNode | null} node
 */
const getParents = (node) => {
  var chain = [];
  while (node) {
    node.data.title && chain.unshift(node.data.title);
    node = node.parent;
  }
  return chain;
};

// find the first parent text id to make legifrance links later
/**
 * @param {import("src").DilaNode} node
 */
const getParentTextId = (node) => {
  let id;
  let tempNode = node.parent;
  while (tempNode) {
    if (
      tempNode.data &&
      tempNode.data.id &&
      tempNode.data.id.match(/^(KALI|LEGI)TEXT\d+$/)
    ) {
      id = tempNode.data.id;
      break;
    }
    tempNode = tempNode.parent;
  }
  return id || null;
};

// find the root text id to make legifrance links later
/**
 * @param {import("src").DilaNode | null} node
 */
const getRootId = (node) => {
  let id;
  while (node) {
    id = node.data.id;
    node = node.parent;
  }
  return id || null;
};

/**
 * @param {import("src").DilaNode} node
 * @returns {import("src").DilaNodeWithContext} node
 */
const addContext = (node) => ({
  ...node,
  context: {
    parents: getParents(node),
    textId: getParentTextId(node),
    containerId: getRootId(node),
  },
});

// dont include children in final results
/**
 * @param {import("unist").Node} node
 */
const stripChildren = (node) => node; //({ children, ...props }) => props;

/**
 *
 * @param {import("src").DilaNode} tree1
 * @param {import("src").DilaNode} tree2
 * @param {alerts.nodeComparatorFn} comparator
 * @returns {alerts.AstChanges} diffed articles nodes
 */
export const compareArticles = (tree1, tree2, comparator) => {
  const parentsTree1 = parents(tree1);
  const parentsTree2 = parents(tree2);

  // all articles from tree1
  const articles1 = selectAll("article", parentsTree1).map(addContext);
  const articles1cids = articles1
    .map((a) => a && a.data && a.data.cid)
    .filter(Boolean);
  // all articles from tree2
  const articles2 = selectAll("article", parentsTree2).map(addContext);
  const articles2cids = articles2
    .map((a) => a && a.data && a.data.cid)
    .filter(Boolean);

  // new : articles in tree2 not in tree1
  const newArticles = articles2.filter(
    (art) => art && art.data && !articles1cids.includes(art.data.cid)
  );
  const newArticlesCids = newArticles.map((a) => a.data.cid);

  // supressed: articles in tree1 not in tree2
  const missingArticles = articles1.filter(
    (art) => art && art.data && !articles2cids.includes(art.data.cid)
  );

  // modified : articles with modified texte
  const modifiedArticles = articles2.filter(
    (art) =>
      art &&
      art.data &&
      // exclude new articles
      !newArticlesCids.includes(art.data.cid) &&
      articles1.find(
        // same article, different texte
        (art2) =>
          art2 &&
          art2.data &&
          art2.data.cid === art.data.cid &&
          comparator(art, art2)
      )
  );

  // all sections from tree1
  const sections1 = selectAll("section", parentsTree1).map(addContext);

  const sections1cids = sections1.map((a) => a.data.cid);

  // all sections from tree2
  const sections2 = selectAll("section", parentsTree2).map(addContext);
  const sections2cids = sections2.map((a) => a.data.cid);

  // new : sections in tree2 not in tree1
  const newSections = sections2.filter(
    (section) => !sections1cids.includes(section.data.cid)
  );
  const newSectionsCids = newSections.map((a) => a.data.cid);

  // supressed: sections in tree1 not in tree2
  const missingSections = sections1.filter(
    (section) => !sections2cids.includes(section.data.cid)
  );

  // modified : sections with modified texte
  const modifiedSections = sections2.filter(
    (section) =>
      // exclude new sections
      !newSectionsCids.includes(section.data.cid) &&
      sections1.find(
        // same section, different etat
        (section2) =>
          section2.data.cid === section.data.cid &&
          section2.data.etat !== section.data.etat
      )
  );

  const changes = {
    added: [...newSections, ...newArticles].map(stripChildren),
    removed: [...missingSections, ...missingArticles].map(stripChildren),
    modified: [
      ...modifiedSections.map((modif) => ({
        ...modif,
        // add the previous version in the result so we can diff later
        previous: sections1.find((a) => a.data.cid === modif.data.cid),
      })),
      ...modifiedArticles.map((modif) => ({
        ...modif,
        // add the previous version in the result so we can diff later
        previous: articles1.find((a) => a.data.cid === modif.data.cid),
      })),
    ].map(stripChildren),
  };

  return changes;
};
