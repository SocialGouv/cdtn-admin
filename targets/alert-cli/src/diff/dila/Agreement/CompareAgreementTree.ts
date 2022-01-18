import type {
  DilaAddedNode,
  DilaModifiedNode,
  DilaNode,
  DilaRemovedNode,
  DilaSection,
} from "@shared/types";
import type {
  AgreementArticle,
  AgreementSection,
} from "@socialgouv/kali-data-types";
import parents from "unist-util-parents";
import { selectAll } from "unist-util-select";

import type { Diff, WithParent } from "../types";
import type { AgreementFileChange } from "./types";

const kaliArticleDiff = (art1: AgreementArticle, art2: AgreementArticle) =>
  art1.data.content !== art2.data.content || art1.data.etat !== art2.data.etat;

export function compareAgreementTree(fileChange: AgreementFileChange): Diff {
  const previousText = parents(fileChange.previous);
  const currentText = parents(fileChange.current);

  // all articles from tree1
  const articlesPrevious = selectAll<WithParent<AgreementArticle>>(
    "article",
    previousText
  );
  const articlesPreviousCids = articlesPrevious.map((a) => a.data.cid);
  // all articles from tree2
  const articlesCurrent = selectAll<WithParent<AgreementArticle>>(
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
        (art2) => art2.data.cid === art.data.cid && kaliArticleDiff(art, art2)
      )
  );

  // all sections from tree1
  const sectionsPrevious = selectAll<WithParent<AgreementSection>>(
    "section",
    previousText
  );
  const sectionsPreviousCids = sectionsPrevious.map((a) => a.data.cid);

  // all sections from tree2
  const sectionsCurrent = selectAll<WithParent<AgreementSection>>(
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

const getParents = (node: WithParent<DilaNode>) => {
  const chain = [];
  let tempNode: WithParent<DilaSection> | null = null;
  if (node.type === "article") {
    tempNode = node.parent;
  } else {
    tempNode = node;
  }
  while (tempNode) {
    chain.unshift(tempNode.data.title);
    tempNode = tempNode.parent;
  }
  return chain;
};
