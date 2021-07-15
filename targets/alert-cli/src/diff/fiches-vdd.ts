import type { FicheVddInfo, VddAlertChanges, VddChanges } from "@shared/types";
import type { ConvenientPatch, Tree } from "nodegit";

import { createToJson } from "../node-git.helpers";
import type {
  FicheVdd,
  FicheVddIndex,
  FicheVddNode,
  GitTagData,
} from "../types";
import { vddPrequalifiedRelevantDocuments } from "./preQualified-relevantContent";

export async function processVddDiff(
  repositoryId: string,
  tag: GitTagData,
  patches: ConvenientPatch[],
  fileFilter: (path: string) => boolean,
  prevTree: Tree,
  currTree: Tree
): Promise<VddAlertChanges[]> {
  const changes: VddChanges = {
    added: [],
    documents: [],
    modified: [],
    removed: [],
  };

  const filteredPatches = patches.filter((patch) =>
    fileFilter(patch.newFile().path())
  );

  changes.removed = await Promise.all(
    filteredPatches
      .filter((patch) => patch.isDeleted())
      .map(async (patch) => toSimpleVddChange(patch, prevTree))
  );

  // handle added patch smarter
  const index = await createToJson<FicheVddIndex[]>("data/index.json")(
    currTree
  );
  const mayInterestCdtn = createCdtnMatcherFile(index);
  changes.added = await Promise.all(
    patches.flatMap((patch) => {
      if (patch.isAdded() && mayInterestCdtn(patch.newFile().path())) {
        return toSimpleVddChange(patch, currTree);
      }
      return [];
    })
  );

  const modified = filteredPatches.flatMap((patch) =>
    patch.isModified() ? [patch.newFile().path()] : []
  );

  const particuliers = modified.filter((path) => path.includes("particuliers"));

  const professionnels = modified
    .filter((path) => path.includes("professionnels"))
    .filter((path) => {
      const id = /\w+.json$/.exec(path);
      if (!id) {
        return false;
      }
      return particuliers.every((file) => !new RegExp(`${id[0]}$`).test(file));
    });

  const associations = modified
    .filter((path) => path.includes("associations"))
    .filter((path) => {
      const id = /\w+.json$/.exec(path);
      if (!id) {
        return false;
      }
      return particuliers.every((file) => !new RegExp(`${id[0]}$`).test(file));
    })
    .filter((path) => {
      const id = /\w+.json$/.exec(path);
      if (!id) {
        return false;
      }
      return professionnels.every(
        (file) => !new RegExp(`${id[0]}$`).test(file)
      );
    });

  const filterFiles = particuliers.concat(professionnels, associations);

  const modifiedFiles = await Promise.all(
    filterFiles.map(async (fichePath) => {
      if (fichePath.includes("index.json")) return;
      if (
        changes.removed
          .concat(changes.added)
          .some((fiche) => `data/${fiche.type}/${fiche.id}.json` === fichePath)
      ) {
        return;
      }

      const toJson = createToJson<FicheVdd>(fichePath);
      const [previousJSON, currentJSON] = await Promise.all(
        [prevTree, currTree].map(toJson)
      );
      const previousText = getTextFromRawFiche(previousJSON);
      const currentText = getTextFromRawFiche(currentJSON);
      if (previousText !== currentText) {
        return {
          currentText,
          id: currentJSON.id,
          previousText,
          title: getTitleFromRawFiche(currentJSON),
          type: fichePath.split("/")[1],
        };
      }
    })
  );
  // cannot flat map because of async;
  changes.modified = modifiedFiles.flatMap((item) =>
    item === undefined ? [] : [item]
  );

  if (
    changes.added.length === 0 &&
    changes.modified.length === 0 &&
    changes.removed.length === 0
  ) {
    return [];
  }
  const documents = await vddPrequalifiedRelevantDocuments(changes);
  console.log(`${tag.ref} ${documents.length} prequalified found`);
  return [
    {
      date: tag.commit.date(),
      ref: tag.ref,
      title: "fiche service-public",
      type: "vdd",
      ...changes,
      documents,
    },
  ];
}

const getTitleFromRawFiche = (fiche: FicheVdd): string => {
  const publication = fiche.children[0];

  return getText(getChild(publication, "dc:title"));
};

const getTextFromRawFiche = (fiche: FicheVdd): string => {
  const publication = fiche.children[0];

  // We filter out the elements we will never use nor display
  if (publication.children) {
    publication.children = publication.children.filter(
      (child) => child.name !== "OuSAdresser" && child.name !== "ServiceEnLigne"
    );
  }

  const intro = getText(getChild(publication, "Introduction"));
  const texte = getText(getChild(publication, "Texte"));
  const listeSituations = getText(getChild(publication, "ListeSituations"));
  const text = intro + " " + texte + " " + listeSituations;

  return text;
};

function getChild(
  element: FicheVddNode,
  name: string
): FicheVddNode | undefined {
  if (element.children) {
    return element.children.find((el) => el.name === name);
  }
}

function getText(element?: FicheVddNode): string {
  if (!element) {
    return "";
  }
  if (element.type === "text" && element.text) {
    return element.text.trim();
  }
  if (element.children) {
    return element.children.map((child) => getText(child)).join(" ");
  }
  return "";
}

async function toSimpleVddChange(
  patch: ConvenientPatch,
  tree: Tree
): Promise<FicheVddInfo> {
  const filepath = patch.newFile().path();
  const match = /(\w+)\/(\w+)\.json$/.exec(filepath);
  if (!match) {
    throw new Error(`[toSimpleVddChange] Can't parse ${filepath}`);
  }
  const toJson = createToJson<FicheVdd>(patch.newFile().path());
  const fiche = await toJson(tree);
  return {
    id: match[2],
    title: getTitleFromRawFiche(fiche),
    type: match[1],
  };
}

const createCdtnMatcherFile = (fileIndex: FicheVddIndex[]) => {
  const idsMap = new Map<string, string[]>();
  for (const item of fileIndex) {
    if (item.id.startsWith("F")) {
      idsMap.set(
        item.id,
        item.breadcrumbs.slice(1).map(({ id }) => id)
      );
    }
  }

  const followedThemeIds = [
    "N19806",
    "N107",
    "N31477",
    "N20286",
    "N31002",
    "N31132",
    "N31146",
    "N261",
    "N277",
    "N559",
    "N16178",
    "N16594",
    "N24267",
    "N24266",
    "N22150",
    "N10481",
    "N31133",
  ];
  return (filepath: string) => {
    const id = /(\w+)\.json$/.exec(filepath);

    if (!id) {
      return false;
    }
    if (!id[1].startsWith("F")) {
      return false;
    }
    const breadcrumb = idsMap.get(id[1]) ?? [];
    return breadcrumb.some((themeId) => followedThemeIds.includes(themeId));
  };
};
