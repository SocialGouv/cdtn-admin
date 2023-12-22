import type {
  DilaAddedNode,
  DilaModifiedNode,
  DilaNode,
  DilaRemovedNode,
} from "@shared/types";
import type {
  Agreement,
  AgreementArticle,
  AgreementArticleData,
  AgreementSectionData,
} from "@socialgouv/kali-data-types";
import type {
  Code,
  CodeArticle,
  CodeArticleData,
  CodeSectionData,
} from "@socialgouv/legi-data-types";
import parents from "unist-util-parents";
import { selectAll } from "unist-util-select";

import type { AgreementFileChange } from "./kali/types";
import type { CodeFileChange } from "./legi/types";
import type {
  Article,
  ArticleWithParent,
  Diff,
  Section,
  WithParent,
} from "./types";

const isCodeArticle = (
  object: WithParent<Article<AgreementArticle | CodeArticle>>
): object is ArticleWithParent<CodeArticle> => "texte" in object.data;

const isAgreementArticle = (
  object: WithParent<Article<AgreementArticle | CodeArticle>>
): object is ArticleWithParent<AgreementArticle> => "content" in object.data;

const isSectionData = (
  object:
    | AgreementArticleData
    | AgreementSectionData
    | CodeArticleData
    | CodeSectionData
): object is AgreementSectionData | CodeSectionData => "title" in object;

const articleDiff = (
  art1: WithParent<Article<AgreementArticle | CodeArticle>>,
  art2: WithParent<Article<AgreementArticle | CodeArticle>>
): boolean => {
  if (isCodeArticle(art1) && isCodeArticle(art2)) {
    return legiArticleDiff(art1, art2);
  } else if (isAgreementArticle(art1) && isAgreementArticle(art2)) {
    return kaliArticleDiff(art1, art2);
  }
  return false;
};

const kaliArticleDiff = (
  art1: ArticleWithParent<AgreementArticle>,
  art2: ArticleWithParent<AgreementArticle>
) =>
  art1.data.content !== art2.data.content || art1.data.etat !== art2.data.etat;

const legiArticleDiff = (
  art1: ArticleWithParent<CodeArticle>,
  art2: ArticleWithParent<CodeArticle>
) =>
  art1.data.texte !== art2.data.texte ||
  art1.data.etat !== art2.data.etat ||
  art1.data.nota !== art2.data.nota;

function extractData<T extends AgreementFileChange | CodeFileChange>(
  node: Agreement | Code | null
): {
  articles: WithParent<Article<T>>[];
  sections: WithParent<Section<T>>[];
} {
  const currentText = parents(node);

  return {
    articles: selectAll<WithParent<Article<T>>>("article", currentText),
    sections: selectAll<WithParent<Section<T>>>("section", currentText),
  };
}

export function convertToDilaAdded(change: Agreement): Diff {
  const data = extractData(change);

  return {
    added: data.sections
      .map(addedNodeAdapter)
      .concat(data.articles.map(addedNodeAdapter)),
    modified: [],
    removed: [],
  };
}

export function convertToDilaRemoved(change: Agreement): Diff {
  const data = extractData(change);

  return {
    added: [],
    modified: [],
    removed: data.sections
      .map(removedNodeAdapter)
      .concat(data.articles.map(removedNodeAdapter)),
  };
}

export function compareDilaContent<T extends Agreement | Code>(
  previous: T,
  current: T
): Diff {
  const previousData = extractData(previous);
  const articlesPreviousCids = previousData.articles.map((a) => a.data.cid);

  const currentData = extractData(current);
  const articlesCurrentCids = currentData.articles.map((a) => a.data.cid);

  // new : articles in current not in previous
  const newArticles = currentData.articles.filter(
    (art) => !articlesPreviousCids.includes(art.data.cid)
  );
  const newArticlesCids = newArticles.map((a) => a.data.cid);

  // suppressed: articles in previous not in tree2
  const missingArticles = previousData.articles.filter(
    (art) => !articlesCurrentCids.includes(art.data.cid)
  );

  // modified : articles with modified texte
  const modifiedArticles = currentData.articles.filter(
    (art) =>
      // exclude new articles
      !newArticlesCids.includes(art.data.cid) &&
      previousData.articles.find(
        // same article, different texte
        (art2) => art2.data.cid === art.data.cid && articleDiff(art, art2)
      )
  );

  const sectionsPreviousCids = previousData.sections.map((a) => a.data.cid);
  const sectionsCurrentCids = currentData.sections.map((a) => a.data.cid);

  // new : sections in current not in previous
  const newSections = currentData.sections.filter(
    (section) => !sectionsPreviousCids.includes(section.data.cid)
  );
  const newSectionsCids = newSections.map((a) => a.data.cid);

  // suppressed: sections in previous not in current
  const missingSections = previousData.sections.filter(
    (section) => !sectionsCurrentCids.includes(section.data.cid)
  );

  // modified : sections with modified text
  const modifiedSections = currentData.sections.filter(
    (curSection) =>
      // exclude new sections
      !newSectionsCids.includes(curSection.data.cid) &&
      previousData.sections.find(
        // same section, different etat
        (prevSection) =>
          prevSection.data.cid === curSection.data.cid &&
          prevSection.data.etat !== curSection.data.etat
      )
  );
  const modifiedNodeAdapter = createModifiedAdapter([
    ...previousData.articles,
    ...previousData.sections,
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
