import type {
  DilaAddedNode,
  DilaModifiedNode,
  DilaNode,
  DilaRemovedNode,
} from "@shared/types";
import type {
  AgreementArticle,
  AgreementArticleData,
  AgreementSectionData,
} from "@socialgouv/kali-data-types";
import type {
  CodeArticle,
  CodeArticleData,
  CodeSectionData,
} from "@socialgouv/legi-data-types";
import parents from "unist-util-parents";
import { selectAll } from "unist-util-select";

import type { AgreementFileChange } from "./Agreement/types";
import type { CodeFileChange } from "./Code/types";
import type {
  Article,
  ArticleWithParent,
  Diff,
  FileChange,
  Section,
  WithParent,
} from "./types";

const isSectionData = (
  object:
    | AgreementArticleData
    | AgreementSectionData
    | CodeArticleData
    | CodeSectionData
): object is AgreementSectionData | CodeSectionData => "title" in object;

export function compareTree<T extends AgreementFileChange | CodeFileChange>(
  fileChange: FileChange<T>,
  articleDiff: (
    art1: WithParent<Article<AgreementArticle | CodeArticle>>,
    art2: WithParent<Article<AgreementArticle | CodeArticle>>
  ) => boolean
): Diff {
  const previousText = parents(fileChange.previous);
  const currentText = parents(fileChange.current);

  // all articles from tree1
  const articlesPrevious = selectAll<ArticleWithParent<Article<T>>>(
    "article",
    previousText
  );
  const articlesPreviousCids = articlesPrevious.map((a) => a.data.cid);
  // all articles from tree2
  const articlesCurrent = selectAll<ArticleWithParent<Article<T>>>(
    "article",
    currentText
  );
  const articlesCurrentCids = articlesCurrent.map((a) => a.data.cid);

  // new : articles in current not in previous
  const newArticles = articlesCurrent.filter(
    (art) => !articlesPreviousCids.includes(art.data.cid)
  );
  const newArticlesCids = newArticles.map((a) => a.data.cid);

  // supressed: articles in previous not in tree2
  const missingArticles = articlesPrevious.filter(
    (art) => !articlesCurrentCids.includes(art.data.cid)
  );

  // modified : articles with modified texte
  const modifiedArticles = articlesCurrent.filter(
    (art) =>
      // exclude new articles
      !newArticlesCids.includes(art.data.cid) &&
      articlesPrevious.find(
        // same article, different texte
        (art2) => art2.data.cid === art.data.cid && articleDiff(art, art2)
      )
  );

  // all sections from tree1
  const sectionsPrevious = selectAll<WithParent<Section<T>>>(
    "section",
    previousText
  );
  const sectionsPreviousCids = sectionsPrevious.map((a) => a.data.cid);

  // all sections from tree2
  const sectionsCurrent = selectAll<WithParent<Section<T>>>(
    "section",
    currentText
  );
  const sectionsCurrentCids = sectionsCurrent.map((a) => a.data.cid);

  // new : sections in tree2 not in tree1
  const newSections = sectionsCurrent.filter(
    (section) => !sectionsPreviousCids.includes(section.data.cid)
  );
  const newSectionsCids = newSections.map((a) => a.data.cid);

  // supressed: sections in tree1 not in tree2
  const missingSections = sectionsPrevious.filter(
    (section) => !sectionsCurrentCids.includes(section.data.cid)
  );

  // modified : sections with modified texte
  const modifiedSections = sectionsCurrent.filter(
    (curSection) =>
      // exclude new sections
      !newSectionsCids.includes(curSection.data.cid) &&
      sectionsPrevious.find(
        // same section, different etat
        (prevSection) =>
          prevSection.data.cid === curSection.data.cid &&
          prevSection.data.etat !== curSection.data.etat
      )
  );
  const modifiedNodeAdapter = createModifiedAdapter([
    ...articlesPrevious,
    ...sectionsPrevious,
  ]);

  return {
    added: newSections
      .map(addedNodeAdapter)
      .concat(newArticles.map(addedNodeAdapter)),
    modified: modifiedSections
      .map(modifiedNodeAdapter)
      .concat(modifiedArticles.map(modifiedNodeAdapter)),
    removed: missingSections
      .map(removedNodeAdapter)
      .concat(missingArticles.map(removedNodeAdapter)),
  };
}

function addedNodeAdapter(node: WithParent<DilaNode>): DilaAddedNode {
  return {
    cid: node.data.cid,
    etat: node.data.etat,
    id: node.data.id,
    parents: getParents(node),
    title:
      node.type === "article" ? node.data.num ?? "Article" : node.data.title,
  };
}

function removedNodeAdapter(node: WithParent<DilaNode>): DilaRemovedNode {
  return {
    cid: node.data.cid,
    id: node.data.id,
    parents: getParents(node),
    title:
      node.type === "article" ? node.data.num ?? "Article" : node.data.title,
  };
}

const createModifiedAdapter =
  (modified: WithParent<DilaNode>[]) =>
  (node: WithParent<DilaNode>): DilaModifiedNode => {
    const diffs = [];
    const previousNode = modified.find((a) => node.data.cid === a.data.cid);
    if (!previousNode) {
      throw new Error("previous node not found");
    }
    if ("texte" in node.data && "texte" in previousNode.data) {
      if (node.data.texte !== previousNode.data.texte) {
        diffs.push({
          currentText: node.data.texte,
          previousText: previousNode.data.texte,
          type: "texte" as const,
        });
      }
    }
    if ("nota" in node.data && "nota" in previousNode.data) {
      if (node.data.nota !== previousNode.data.nota) {
        diffs.push({
          currentText: node.data.nota,
          previousText: previousNode.data.nota,
          type: "nota" as const,
        });
      }
    }
    if ("content" in node.data && "content" in previousNode.data) {
      if (node.data.content !== previousNode.data.content) {
        diffs.push({
          currentText: node.data.content,
          previousText: previousNode.data.content,
          type: "texte" as const,
        });
      }
    }
    if (node.data.etat !== previousNode.data.etat) {
      diffs.push({
        currentText: node.data.etat,
        previousText: previousNode.data.etat,
        type: "etat" as const,
      });
    }

    return {
      cid: node.data.cid,
      diffs,
      etat: node.data.etat,
      id: node.data.id,
      parents: getParents(node),
      title:
        node.type === "article" ? node.data.num ?? "Article" : node.data.title,
    };
  };

const getParents = (node: WithParent<DilaNode> | null) => {
  const chain = [];
  let tempNode = node;
  if (node?.type === "article") {
    tempNode = node.parent;
  }
  while (tempNode) {
    if (isSectionData(tempNode.data)) {
      chain.unshift(tempNode.data.title);
    } else {
      throw new Error(
        "An article cannot be a parent of an article or a section"
      );
    }
    tempNode = tempNode.parent;
  }
  return chain;
};
