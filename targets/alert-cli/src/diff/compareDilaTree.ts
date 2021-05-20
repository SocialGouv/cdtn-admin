import type { AgreementSection } from "@socialgouv/kali-data-types";
import type { Code, CodeSection } from "@socialgouv/legi-data-types";
import type { NodeWithParent } from "unist-util-parents";
import parents from "unist-util-parents";
import { selectAll } from "unist-util-select";

import type {
  AgreementFixed,
  DilaArticle,
  DilaNode,
  DilaNodeForDiff,
  DilaSection,
} from "../types";

const getParents = (node: NodeWithParent<DilaSection, DilaNode> | null) => {
  const chain = [];
  while (node) {
    if (node.type === "section") {
      chain.unshift(node.data.title);
    }
    node = node.parent;
  }
  return chain;
};

/**
 *find the first parent text id to make legifrance links later
 */
const getParentTextId = (node: NodeWithParent<DilaSection, DilaNode>) => {
  let id = null;
  let tempNode = node.parent;
  while (tempNode) {
    if (/^(KALI|LEGI)TEXT\d+$/.exec(tempNode.data.id)) {
      id = tempNode.data.id;
      break;
    }
    tempNode = tempNode.parent;
  }
  return id;
};

/**
 * find the root text id to make legifrance links later
 */
const getRootId = (node?: NodeWithParent<DilaSection, DilaNode> | null) => {
  let id = null;
  while (node) {
    id = node.data.id;
    node = node.parent;
  }
  return id;
};

/**
 * @param {alerts.DilaNode} node
 * @returns {alerts.DilaNodeWithContext} node
 */
const addContext = (
  node: NodeWithParent<DilaSection, DilaArticle | DilaSection>
) => ({
  ...node,
  context: {
    containerId: getRootId(node),
    parents: getParents(node),
    textId: getParentTextId(node),
  },
});

// dont include children in final results
const stripChildren = <A extends { type: string; children?: unknown }>(
  node: A
): Omit<A, "children"> => {
  if (node.type === "section") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, ...props } = node;
    return props;
  }
  return node;
};

// export function compareAgreementArticle(
//   tree1: AgreementFixed,
//   tree2: AgreementFixed,
//   comparator: (art1: AgreementArticle, art2: AgreementArticle) => boolean
// ) {
//   return compareArticles(tree1, tree2, comparator);
// }

// export function compareCodeArticle(
//   tree1: Code,
//   tree2: Code,
//   comparator: (art1: CodeArticle, art2: CodeArticle) => boolean
// ) {
//   return compareArticles(tree1, tree2, comparator);
// }

export function compareArticles<A extends AgreementFixed | Code>(
  tree1: A,
  tree2: A,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comparator: any
) {
  const parentsTree1 = parents<A>(tree1);
  const parentsTree2 = parents<A>(tree2);

  // all articles from tree1
  const articles1 = selectAll<A, NodeWithParent<DilaSection, DilaArticle>>(
    "article",
    parentsTree1
  );

  const articles1cids = articles1.map((a) => a.data.cid);

  // all articles from tree2
  const articles2 = selectAll<A, NodeWithParent<DilaSection, DilaArticle>>(
    "article",
    parentsTree2
  );

  const articles2cids = articles2.map((a) => a.data.cid);

  // new : articles in tree2 not in tree1
  const newArticles = articles2.filter(
    (art) => !articles1cids.includes(art.data.cid)
  );
  const newArticlesCids = newArticles.map((a) => a.data.cid);

  // supressed: articles in tree1 not in tree2
  const missingArticles = articles1.filter(
    (art) => !articles2cids.includes(art.data.cid)
  );

  // modified : articles with modified texte
  const modifiedArticles = articles2.filter(
    (art) =>
      // exclude new articles
      !newArticlesCids.includes(art.data.cid) &&
      articles1.find(
        // same article, different texte
        (art2) => art2.data.cid === art.data.cid && comparator(art, art2)
      )
  );

  // all sections from tree1
  const sections1 = selectAll<A, NodeWithParent<DilaSection, DilaSection>>(
    "section",
    parentsTree1
  );

  const sections1cids = sections1.map((a) => a.data.cid);

  // all sections from tree2
  const sections2 = selectAll<A, NodeWithParent<DilaSection, DilaArticle>>(
    "section",
    parentsTree2
  );
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

  const sectionsWithPrevious: DilaNodeForDiff<
    AgreementSection | CodeSection
  >[] = modifiedSections
    .map((modif) => ({
      ...modif,
      // add the previous version in the result so we can diff later
      previous: sections1.find((a) => a.data.cid === modif.data.cid),
    }))
    .map(addContext);

  const changes = {
    added: [...newSections, ...newArticles].map(addContext).map(stripChildren),
    modified: [
      ...sectionsWithPrevious,
      ...modifiedArticles.map((modif) => ({
        ...modif,
        // add the previous version in the result so we can diff later
        previous: articles1.find((a) => a.data.cid === modif.data.cid),
      })),
    ],
    removed: [...missingSections, ...missingArticles]
      .map(addContext)
      .map(stripChildren),
  };

  return changes;
}
