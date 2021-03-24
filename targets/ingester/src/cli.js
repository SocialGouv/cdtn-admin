import { client } from "@shared/graphql-client";
import { generateCdtnId } from "@shared/id-generator";
import { access, readFile } from "fs/promises";
import getUri from "get-uri";
import got from "got";
import gunzip from "gunzip-maybe";
import pRetry from "p-retry";
import path from "path";
import semver from "semver";
import tar from "tar-fs";
import yargs from "yargs";

import { batchPromises, chunk } from "./lib/batchPromises";
import getAgreementDocuments from "./transform/agreements/index.js";
import getCdtDocuments from "./transform/code-du-travail.js";
import getContributionsDocuments from "./transform/contributions.js";
import getFicheTravailEmploi from "./transform/fiche-travail-emploi.js";
import getFichesServicePublic from "./transform/fichesServicePublic/index.js";

const args = yargs(process.argv)
  .command("ingest", "ingest document into database")
  .example("$0 ingest --dry-run", "count the lines in the given file")
  .alias("d", "dry-run")
  .describe("d", "dry run mode")
  .help().argv;

const getPackageVersionQuery = `
query package_version ($repository: String!) {
  packageVersion: package_version_by_pk(repository: $repository) {
    version
  }
}
`;

const updateDocumentAvailability = `
mutation update_documents($source:String!) {
	documents: update_documents(_set: {is_available: false}, where: {source: {_eq: $source}}) {
    affected_rows
  }
}
`;

const insertDocumentsMutation = `
mutation insert_documents($documents: [documents_insert_input!]!) {
  documents: insert_documents(objects: $documents,  on_conflict: {
    constraint: documents_pkey,
    update_columns: [title, source, slug, text, document, is_available, is_searchable]
  }) {
   returning {cdtn_id}
  }
}
`;

const insertPackageVersionMutation = `
mutation insert_package_version($object:package_version_insert_input!) {
  version: insert_package_version_one(object: $object,  on_conflict: {
    constraint: package_version_pkey,
    update_columns: version
  }) {
    repository, version
  }
}
`;

/**
 *
 * @param {string} pkgName
 */
function getPkgPath(pkgName) {
  return path.join(process.cwd(), "data", pkgName);
}

/**
 *
 * @param {string} pkgName
 * @param {string} latest
 */
async function isPkgOutdated(pkgName, latest) {
  const pkgInfoPath = path.join(getPkgPath(pkgName), "package.json");
  try {
    await access(pkgInfoPath);
    const pkgData = (await readFile(pkgInfoPath)).toString();
    const pkgInfo = JSON.parse(pkgData);
    return semver.lt(pkgInfo.version, latest);
  } catch (error) {
    console.error(`[isPkgOutdated] ${pkgName} not found, download a fresh one`);
    return true;
  }
}
/**
 *
 * @param {string} pkgName
 * @param {string} url
 */
async function download(pkgName, url) {
  return new Promise((resolve, reject) => {
    getUri(url, function (err, rs) {
      // !rs is only here so typescript won't complain
      if (err || !rs) {
        reject(`Error while downloading package ${pkgName} - ${url}`);
        return;
      }
      rs.pipe(gunzip())
        .pipe(
          tar.extract(getPkgPath(pkgName), {
            map: function mapHeader(header) {
              // npm tarball have a root directory called /package so we remove it when extracting
              header.name = header.name.replace("package/", "");
              return header;
            },
          })
        )
        .on("finish", resolve);
    });
  });
}

/** @type {[string, (pkgName:string)=>Promise<import("./index.js").CdtnDocument[]>][]} */
const dataPackages = [
  ["@socialgouv/datafiller-data", () => Promise.resolve([])],
  ["@socialgouv/contributions-data", getContributionsDocuments],
  ["@socialgouv/kali-data", getAgreementDocuments],
  ["@socialgouv/legi-data", getCdtDocuments],
  ["@socialgouv/fiches-vdd", getFichesServicePublic],
  ["@socialgouv/fiches-travail-data", getFicheTravailEmploi],
];

/**
 *
 * @param {string} pkgName
 * @returns {Promise<{url: string, version: string}>}
 */
async function getPackageInfo(pkgName) {
  const pkgInfo = await got(
    `http://registry.npmjs.org/${pkgName}/latest`
  ).json();
  return {
    url: pkgInfo.dist.tarball,
    version: pkgInfo.version,
  };
}

/**
 *
 * @param {string} pkgName
 * @returns {Promise<string|undefined>}
 */
async function getLastIngestedVersion(pkgName) {
  const result = await client
    .query(getPackageVersionQuery, { repository: pkgName })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    throw new Error(`error while retrieving ingester packages version`);
  }

  if (result.data.packageVersion) {
    return result.data.packageVersion.version;
  }
}

/**
 *
 * @param {ingester.CdtnDocument[]} docs
 * @returns {Promise<{cdtn_id:string}[]>}
 */
async function insertDocuments(docs) {
  const result = await client
    .mutation(insertDocumentsMutation, {
      documents: docs.map(
        ({ id, text, title, slug, is_searchable, source, ...document }) => ({
          cdtn_id: generateCdtnId(`${source}${id}`),
          document,
          initial_id: id,
          is_available: true,
          is_searchable,
          meta_description: document.description || "",
          slug,
          source,
          text,
          title,
        })
      ),
    })
    .toPromise();

  if (result.error) {
    console.error(result.error.graphQLErrors[0]);
    throw new Error(`error inserting documents`);
  }
  return result.data.documents.returning;
}
/**
 *
 * @param {string} source
 */
async function initDocAvailabity(source) {
  console.time(`initDocAvailabity ${source}`);
  const result = await client
    .mutation(updateDocumentAvailability, { source })
    .toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error(`error initializing documents availability`);
  }
  console.timeEnd(`initDocAvailabity ${source}`);
  return result.data.documents.affected_rows;
}
/**
 *
 * @param {string} repository
 * @param {string} version
 */
async function updateVersion(repository, version) {
  const result = await client
    .mutation(insertPackageVersionMutation, {
      object: { repository, version },
    })
    .toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error(`error updating package_version ${repository}@${version}`);
  }
  return result.data.version;
}

async function main() {
  const packagesToUpdate = new Map();
  for (const [pkgName, getDocuments] of dataPackages) {
    const pkgInfo = await getPackageInfo(pkgName);
    if (await isPkgOutdated(pkgName, pkgInfo.version)) {
      console.debug(`download package ${pkgName}@${pkgInfo.version}`);
      await download(pkgName, pkgInfo.url);
    }
    const ingestedVersion = await getLastIngestedVersion(pkgName);
    // Need to update the package:
    // if the version is lower than the version from database (ingestedVersion)
    // or the package is not present in the database (ingestedVersion is null).
    if (ingestedVersion && semver.gt(pkgInfo.version, ingestedVersion)) {
      packagesToUpdate.set(pkgName, { getDocuments, version: pkgInfo.version });
    } else if (!ingestedVersion) {
      packagesToUpdate.set(pkgName, { getDocuments, version: pkgInfo.version });
    }
  }
  if (args.dryRun) {
    console.log("dry-run mode");
  }
  /** @type {{cdtn_id:string}[]}} */
  let ids = [];
  console.log(`packages to ingest: ${[...packagesToUpdate.keys()]}`);
  for (const [pkgName, { version, getDocuments }] of packagesToUpdate) {
    console.time(`update ${pkgName}`);
    console.log(` ingest ${pkgName} documents`);
    console.time(` getDocuments ${pkgName}`);
    const documents = await getDocuments(pkgName);
    console.timeEnd(` getDocuments ${pkgName}`);
    console.log(`${pkgName}: ${documents.length} documents`);
    if (!args.dryRun && documents.length > 0) {
      const nbDocs = await initDocAvailabity(documents[0].source);
      console.log(` update availability of ${nbDocs} documents`);
      console.log(
        ` › ready to ingest ${documents.length} documents from ${pkgName}`
      );
      const chunks = chunk(documents, 50);
      const inserts = await batchPromises(
        chunks,
        (docs) =>
          pRetry(() => insertDocuments(docs), {
            onFailedAttempt: (error) => {
              console.error(
                `insert failed ${error.attemptNumber}/${
                  error.retriesLeft + error.attemptNumber
                }`,
                error.name,
                error.message
              );
            },
            retries: 5,
          }),
        10
      );
      ids = ids.concat(inserts.flat());
      console.timeEnd(`update ${pkgName}`);
      // await updateVersion(pkgName, version);
    }
  }
  return ids;
}

main()
  .then((data) => {
    console.log(`Finish ingest ${data.length} documents`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
