import { client } from "@shared/graphql-client";
import fiches from "@socialgouv/datafiller-data/data/externals.json";
import nodegit from "nodegit";
import path from "path";
import semver from "semver";

import { ccns } from "./ccn-list.js";
import { compareArticles } from "./compareTree.js";
import { getRelevantDocuments } from "./relevantContent.js";

/** @type {string[]} */
let listFichesVddId = [];
const fichesVdd = fiches.find(({ title }) => title === "service-public.fr");
if (fichesVdd) {
  listFichesVddId = fichesVdd.urls.flatMap((url) => url.match(/\w\d+$/) || []);
}

const sourcesQuery = `
query getSources {
  sources {
    repository
    tag
  }
}
`;

const insertAlertsMutation = `
mutation insert_alert($alert: alerts_insert_input!) {
  alert: insert_alerts_one(object: $alert,  on_conflict: {
    constraint: alerts_ref_info_key,
    update_columns: [changes]
  }) {
    repository,
    ref
    info
  }
}
`;

const updateSourceMutation = `
mutation updateSource($repository: String!, $tag: String!){
  source: update_sources_by_pk(
    _set:{
      tag: $tag
    },
    pk_columns: {
      repository: $repository
    }
  ){
    repository, tag
  }
}
`;

/**
 *
 * @param { string } repository
 * @returns { alerts.fileFilterFn }
 */
function getFileFilter(repository) {
  switch (repository) {
    case "socialgouv/legi-data":
      // only code-du-travail
      return (path) => /LEGITEXT000006072050\.json$/.test(path);
    case "socialgouv/kali-data":
      // only a ccn matching our list
      return (path) => ccns.some((ccn) => new RegExp(ccn.id).test(path));
    case "socialgouv/fiches-vdd":
      return (path) =>
        ["index.json", ...listFichesVddId].some((id) =>
          new RegExp(id).test(path)
        );
    default:
      return () => false;
  }
}

/**
 *
 * @param { string } repository
 * @returns { alerts.nodeComparatorFn<alerts.DilaNode> }
 */
function getFileComparator(repository) {
  switch (repository) {
    case "socialgouv/legi-data":
      // only code-du-travail
      return (art1, art2) =>
        art1.data.texte !== art2.data.texte ||
        art1.data.etat !== art2.data.etat ||
        art1.data.nota !== art2.data.nota;
    case "socialgouv/kali-data":
      // only a ccn matching our list
      return (art1, art2) =>
        art1.data.content !== art2.data.content ||
        art1.data.etat !== art2.data.etat;
    default:
      return () => false;
  }
}
/**
 *
 * @param { string } repository
 */
function getDiffProcessor(repository) {
  switch (repository) {
    case "socialgouv/legi-data":
    case "socialgouv/kali-data":
      return processDilaDiff;
    case "socialgouv/fiches-vdd":
      return processVddDiff;
    default:
      return () => Promise.resolve([]);
  }
}

/**
 *
 * @param {string} repositoryId
 * @param {alerts.GitTagData} tag
 * @param {string[]} files
 * @param {nodegit.Tree} prevTree
 * @param {nodegit.Tree} currTree
 * @returns {Promise<alerts.DilaAlertChanges[]>}
 */
async function processDilaDiff(repositoryId, tag, files, prevTree, currTree) {
  const compareFn = getFileComparator(repositoryId);
  const fileChanges = await Promise.all(
    files.map(async (file) => {
      const toAst = createToAst(file);

      const [
        currAst,
        prevAst,
      ] = /** @type {alerts.DilaNode[]} */ (await Promise.all(
        [currTree, prevTree].map(toAst)
      ));

      const changes = compareArticles(prevAst, currAst, compareFn);
      const documents = getRelevantDocuments(changes);

      return {
        documents,
        file,
        id: currAst.data.id,
        num: currAst.data.num,
        title: currAst.data.title,
        ...changes,
      };
    })
  );

  return fileChanges
    .filter(
      (file) =>
        file.modified.length > 0 ||
        file.removed.length > 0 ||
        file.added.length > 0 ||
        file.documents.length > 0
    )
    .map((change) => ({
      date: tag.commit.date(),
      ref: tag.ref,
      ...change,
      type: "dila",
    }));
}

/**
 *
 * @param {string} repositoryId
 * @param {alerts.GitTagData} tag
 * @param {string[]} files
 * @param {nodegit.Tree} prevTree
 * @param {nodegit.Tree} currTree
 * @returns {Promise<alerts.VddAlertChanges[]>}
 */
async function processVddDiff(repositoryId, tag, files, prevTree, currTree) {
  const indexFile = files.find((file) => /^data\/index\.json$/.test(file));
  /** @type {alerts.AstChanges} */
  const changes = {
    added: [],
    modified: [],
    removed: [],
  };

  const currList = /** @type {alerts.FicheVddIndex[]}*/ (await createToAst(
    "data/index.json"
  )(currTree));

  if (indexFile) {
    const toAst = createToAst(indexFile);
    const prevList = /** @type {alerts.FicheVddIndex[]}*/ (await toAst(
      prevTree
    ));

    changes.removed = prevList.filter(
      ({ id }) => currList.find((item) => item.id === id) === undefined
    );
    changes.added = currList.filter(
      ({ id }) => prevList.find((item) => item.id === id) === undefined
    );
  }

  changes.modified = await Promise.all(
    files
      .filter((file) => !/index\.json/.test(file))
      .map(async (file) => {
        const toAst = createToAst(file);
        const currAst = /** @type {alerts.FicheVdd}*/ (await toAst(currTree));
        return currList.find(({ id }) => id === currAst.id);
      })
  );

  return [
    {
      date: tag.commit.date(),
      ref: tag.ref,
      title: "fiche service-public",
      type: "vdd",
      ...changes,
    },
  ];
}

/**
 * @param { nodegit.ConvenientPatch } patche
 * @returns { string }
 */
function getFilename(patche) {
  return patche.newFile().path();
}

/**
 *
 * @param {string} file
 * @returns {(tree:nodegit.Tree) => Object}
 */
function createToAst(file) {
  return (tree) =>
    tree
      .getEntry(file)
      .then((entry) => entry.getBlob())
      .then((blob) => JSON.parse(blob.toString()));
}

/**
 * @returns { Promise<alerts.Source[]> }
 */
async function getSources() {
  const result = await client.query(sourcesQuery).toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error("getSources");
  }
  return result.data.sources;
}

/**
 * @param { string } repository
 * @param { alerts.AlertChanges } changes
 * @returns { Promise<alerts.Alert> }
 */
export async function insertAlert(repository, changes) {
  const alert = {
    changes: {
      added: changes.added,
      modified: changes.modified,
      removed: changes.removed,
      ...(changes.type === "dila" && { documents: changes.documents }),
    },
    created_at: changes.date,
    info: {
      title: changes.title,
      type: changes.type,
      ...(changes.type === "dila" && {
        file: changes.file,
        id: changes.id,
        num: changes.num,
        title: changes.title,
      }),
    },
    ref: changes.ref,
    repository,
  };

  const result = await client
    .mutation(insertAlertsMutation, { alert })
    .toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error("insertAlert");
  }
  return result.data.alert;
}
/**
 *
 * @param { string } repository
 * @param { string } tag
 * @returns {Promise<alerts.Source>}
 */
export async function updateSource(repository, tag) {
  const result = await client
    .mutation(updateSourceMutation, {
      repository,
      tag,
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    throw new Error("updateSource");
  }
  return result.data.source;
}
/**
 *
 * @param {alerts.Source} source
 * @returns {Promise<nodegit.Repository>}
 */
async function openRepo({ repository }) {
  const [org, repositoryName] = repository.split("/");
  const localPath = path.join(__dirname, "..", "data", repositoryName);
  let repo;
  try {
    repo = await nodegit.Repository.open(localPath);
    await repo.fetch("origin");
    await repo.checkoutBranch("master");
    await repo.mergeBranches("master", "origin/master");
  } catch (err) {
    console.error(
      `[error] openRepo: unable to open repository ${repository}, trying to clone it`
    );
    repo = await nodegit.Clone.clone(
      `git://github.com/${org}/${repositoryName}`,
      localPath
    );
  }
  return repo;
}
/**
 *
 * @param {nodegit.Repository} repository
 * @param {string} lastTag
 * @returns {Promise<alerts.GitTagData[]>}
 */
async function getNewerTagsFromRepo(repository, lastTag) {
  /** @type {string[]} */
  const tags = await nodegit.Tag.list(repository);
  return await Promise.all(
    tags
      .flatMap((t) => {
        if (!semver.valid(t)) {
          return [];
        }
        if (semver.lt(t, lastTag)) {
          return [];
        }
        return t;
      })
      .sort((a, b) => (semver.lt(a, b) ? -1 : 1))
      .map(async (tag) => {
        const reference = await repository.getReference(tag);
        const targetRef = await reference.peel(nodegit.Object.TYPE.COMMIT);
        const commit = await repository.getCommit(targetRef.id());
        return {
          commit,
          ref: tag,
        };
      })
  );
}

/**
 *
 * @param {alerts.GitTagData[]} tags
 * @param {string} repositoryId
 */
async function getDiffFromTags(tags, repositoryId) {
  let [previousTag] = tags;
  const [, ...newTags] = tags;

  /** @type {(alerts.AlertChanges)[]}  */
  const allChanges = [];

  const fileFilter = getFileFilter(repositoryId);
  const diffProcessor = getDiffProcessor(repositoryId);

  for (const tag of newTags) {
    const previousCommit = previousTag.commit;
    const { commit } = tag;
    const [prevTree, currTree] = await Promise.all([
      previousCommit.getTree(),
      commit.getTree(),
    ]);

    const diff = await currTree.diff(prevTree);
    const patches = await diff.patches();

    const files = patches.map(getFilename).filter(fileFilter);

    const changes = await diffProcessor(
      repositoryId,
      tag,
      files,
      prevTree,
      currTree
    );
    if (changes.length > 0) {
      allChanges.push(...changes);
    }
    previousTag = tag;
  }
  return allChanges;
}

async function main() {
  const sources = await getSources();

  const results = [];
  for (const source of sources) {
    const repo = await openRepo(source);
    const tags = await getNewerTagsFromRepo(repo, source.tag);
    const [lastTag] = tags.slice(-1);
    if (lastTag) {
      const diffs = await getDiffFromTags(tags, source.repository);
      results.push({
        changes: diffs,
        newRef: lastTag.ref,
        repository: source.repository,
      });
    }
  }

  if (process.env.DUMP) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const result of results) {
      if (result.changes.length === 0) {
        console.log(`no update for ${result.repository}`);
        continue;
      }
      const inserts = await Promise.all(
        result.changes.map((diff) => insertAlert(result.repository, diff))
      );
      inserts.forEach((insert) => {
        const { ref, repository, info } = insert;
        console.log(`insert alert for ${ref} on ${repository} (${info.file})`);
      });
      console.log(`create ${inserts.length} alert for ${result.repository}`);
      const update = await updateSource(result.repository, result.newRef);
      console.log(`update source ${update.repository} to ${update.tag}`);
    }
  }
}

main().catch(console.error);
