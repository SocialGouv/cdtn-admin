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

import type { DocumentReferences } from "../extractDilaReferences/types";
import { createToJson } from "../node-git.helpers";
import { getRelevantDocuments } from "../relevantContent";
import type { DilaNode, DilaSection, GitTagData } from "../types";

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

export type DilaAlertChanges = DilaChanges & {
  type: "dila";
  ref: string;
  title: string;
  date: Date;
  id: string;
  file: string;
  num?: number;
};

export type DilaChanges = {
  modified: DilaModifiedNode[];
  added: DilaAddedNode[];
  removed: DilaRemovedNode[];
  documents: DocumentReferences[];
};

export type DilaAddedNode = {
  etat: string;
  parents: string[];
  title: string;
  id: string;
  cid: string;
};

export type DilaRemovedNode = {
  parents: string[];
  title: string;
  id: string;
  cid: string;
};

export type DilaModifiedNode = {
  parents: string[];
  title: string;
  id: string;
  cid: string;
  etat: string;
  diffs: DiffInfo[];
};

type DiffInfo = {
  type: "etat" | "nota" | "texte";
  currentText: string;
  previousText: string;
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
  prevTree: Tree,
  currTree: Tree
): Promise<DilaAlertChanges[]> {
  const fileChanges = await Promise.all(
    patches.map(async (patch) => {
      const file = patch.newFile().path();

      if (repositoryId === "@socialgouv/legi-data") {
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
        current: current,
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
            `[info] found ${documents.length} documents impacted by release v${tag.ref} on ${repositoryId}`,
            { file: fileChange.file }
          );
        }
        return {
          ...changes,
          documents,
          file: fileChange.file,
          id: fileChange.current.data.id,
          title: fileChange.current.data.title,
        };
      } else {
        const changes = compareTree<Agreement>(fileChange);
        const documents = await getRelevantDocuments(changes);
        if (documents.length > 0) {
          console.log(
            `[info] found ${documents.length} documents impacted by release v${tag.ref} on ${repositoryId}, (idcc: ${fileChange.current.data.num})`,
            { file: fileChange.file }
          );
        }
        return {
          ...changes,
          documents,
          file: fileChange.file,
          id: fileChange.current.data.id,
          num: fileChange.current.data.num,
          title: fileChange.current.data.shortTitle,
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
          ...change.documents,
          ...change,
        },
      ];
    }
    return [];
  });
}

function compareTree<A extends Agreement | Code>(fileChange: FileChange<A>) {
  const parentsTree1 = parents(fileChange.current);
  const parentsTree2 = parents(fileChange.previous);

  // all articles from tree1
  const articles1 = selectAll<
    A extends Code ? WithParent<CodeArticle> : WithParent<AgreementArticle>
  >("article", parentsTree1);
  const articles1cids = articles1.map((a) => a.data.cid);
  // all articles from tree2
  const articles2 = selectAll<
    A extends Code ? WithParent<CodeArticle> : WithParent<AgreementArticle>
  >("article", parentsTree2);
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
        (art2) =>
          art2.data.cid === art.data.cid && fileChange.comparator(art, art2)
      )
  );

  // all sections from tree1
  const sections1 = selectAll<
    A extends Code ? WithParent<CodeSection> : WithParent<AgreementSection>
  >("section", parentsTree1);
  const sections1cids = sections1.map((a) => a.data.cid);

  // all sections from tree2
  const sections2 = selectAll<
    A extends Code ? WithParent<CodeSection> : WithParent<AgreementSection>
  >("section", parentsTree2);
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
  const modifiedNodeAdapter = createModifiedAdapter(articles1);

  return {
    added: newArticles
      .map(addedNodeAdapter)
      .concat(newSections.map(addedNodeAdapter)),
    modified: modifiedArticles
      .map(modifiedNodeAdapter)
      .concat(modifiedSections.map(modifiedNodeAdapter)),
    removed: missingArticles
      .map(removedNodeAdapter)
      .concat(missingSections.map(removedNodeAdapter)),
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
const createModifiedAdapter = (modified: WithParent<DilaNode>[]) => (
  node: WithParent<DilaNode>
): DilaModifiedNode => {
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
