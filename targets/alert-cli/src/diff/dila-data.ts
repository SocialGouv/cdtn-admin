import type {
  DilaAddedNode,
  DilaAlertChanges,
  DilaModifiedNode,
  DilaNode,
  DilaRemovedNode,
  DilaSection,
} from "@shared/types";
import type {
  Agreement,
  AgreementArticle,
  AgreementSection,
} from "@socialgouv/kali-data-types";
import type {
  Code,
  CodeArticle,
  CodeSection,
} from "@socialgouv/legi-data-types";
import type { ConvenientPatch, Tree } from "nodegit";
import parents from "unist-util-parents";
import { selectAll } from "unist-util-select";

import { createToJson } from "../node-git.helpers";
import type { GitTagData } from "../types";
import { getRelevantDocuments } from "./dila-relevantContent";

type FileChange<A extends Agreement | Code> = {
  type: A extends Code ? "legi" : "kali";
  current: A extends Code ? Code : Agreement;
  previous: A extends Code ? Code : Agreement;
  file: string;
  comparator: (
    art1: A extends Code ? CodeArticle : AgreementArticle,
    art2: A extends Code ? CodeArticle : AgreementArticle
  ) => boolean;
};

type WithParent<
  A extends (AgreementArticle | AgreementSection) | (CodeArticle | CodeSection)
> = A & {
  parent: WithParent<
    A extends CodeArticle | CodeSection ? CodeSection : AgreementSection
  > | null;
};

const legiArticleDiff = (art1: CodeArticle, art2: CodeArticle) =>
  art1.data.texte !== art2.data.texte ||
  art1.data.etat !== art2.data.etat ||
  art1.data.nota !== art2.data.nota;

const kaliArticleDiff = (art1: AgreementArticle, art2: AgreementArticle) =>
  art1.data.content !== art2.data.content || art1.data.etat !== art2.data.etat;

export async function processDilaDataDiff(
  repositoryId: string,
  tag: GitTagData,
  patches: ConvenientPatch[],
  fileFilter: (path: string) => boolean,
  prevTree: Tree,
  currTree: Tree
): Promise<DilaAlertChanges[]> {
  const filteredPatches = patches.filter((patch) =>
    fileFilter(patch.newFile().path())
  );

  const fileChanges = await Promise.all(
    filteredPatches.map(async (patch) => {
      const file = patch.newFile().path();
      if (repositoryId === "socialgouv/legi-data") {
        const toAst = createToJson<Code>(file);
        const [current, previous] = await Promise.all(
          [currTree, prevTree].map(toAst)
        );
        return {
          comparator: legiArticleDiff,
          current,
          file,
          previous,
          type: "legi" as const,
        };
      }
      const toAst = createToJson<Agreement>(file);
      const [current, previous] = await Promise.all(
        [currTree, prevTree].map(toAst)
      );
      return {
        comparator: kaliArticleDiff,
        current,
        file,
        previous,
        type: "kali" as const,
      };
    })
  );

  const dilaChanges = await Promise.all(
    fileChanges.map(async (fileChange) => {
      if (fileChange.type === "legi") {
        const changes = compareTree<Code>(fileChange);

        const documents = await getRelevantDocuments(changes);
        if (documents.length > 0) {
          console.log(
            `[info] found ${documents.length} documents impacted by release ${tag.ref} on ${repositoryId}`,
            { file: fileChange.file }
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const data = fileChange.current.data
          ? fileChange.current.data
          : fileChange.previous.data;
        return {
          ...changes,
          documents,
          file: fileChange.file,
          id: data.id,
          title: data.title,
        };
      } else {
        const changes = compareTree<Agreement>(fileChange);
        const documents = await getRelevantDocuments(changes);
        if (documents.length > 0) {
          console.log(
            `[info] found ${documents.length} documents impacted by release ${tag.ref} on ${repositoryId}, (idcc: ${fileChange.current.data.num})`,
            { file: fileChange.file }
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const data = fileChange.current.data
          ? fileChange.current.data
          : fileChange.previous.data;
        return {
          ...changes,
          documents,
          file: fileChange.file,
          id: data.id,
          num: data.num,
          title: data.shortTitle,
        };
      }
    })
  );

  return dilaChanges.flatMap((change) => {
    if (
      change.modified.length > 0 ||
      change.removed.length ||
      change.added.length
    ) {
      return [
        {
          date: tag.commit.date(),
          ref: tag.ref,
          type: "dila",
          ...change,
        },
      ];
    }
    return [];
  });
}

function compareTree<A extends Agreement | Code>(fileChange: FileChange<A>) {
  const previousText = parents(fileChange.previous);
  const currentText = parents(fileChange.current);

  // all articles from tree1
  const articlesPrevious = selectAll<
    A extends Code ? WithParent<CodeArticle> : WithParent<AgreementArticle>
  >("article", previousText);
  const articlesPreviousCids = articlesPrevious.map((a) => a.data.cid);
  // all articles from tree2
  const articlesCurrent = selectAll<
    A extends Code ? WithParent<CodeArticle> : WithParent<AgreementArticle>
  >("article", currentText);
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
        (art2) =>
          art2.data.cid === art.data.cid && fileChange.comparator(art, art2)
      )
  );

  // all sections from tree1
  const sectionsPrevious = selectAll<
    A extends Code ? WithParent<CodeSection> : WithParent<AgreementSection>
  >("section", previousText);
  const sectionsPreviousCids = sectionsPrevious.map((a) => a.data.cid);

  // all sections from tree2
  const sectionsCurrent = selectAll<
    A extends Code ? WithParent<CodeSection> : WithParent<AgreementSection>
  >("section", currentText);
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
