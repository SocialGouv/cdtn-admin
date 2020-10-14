import { client } from "@shared/graphql-client";
import { generateCdtnId } from "@shared/id-generator";
import { access, readFile } from "fs/promises";
import getUri from "get-uri";
import got from "got";
import gunzip from "gunzip-maybe";
import path from "path";
import semver from "semver";
import tar from "tar-fs";
import yargs from "yargs";

import { batchPromises } from "./lib/batchPromises";
import getAgreementDocuments from "./transform/agreements.js";
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

const insertDocumentsMutation = `
mutation insert_documents($document: documents_insert_input!) {
  document: insert_documents_one(object: $document,  on_conflict: {
    constraint: documents_initial_id_source_key,
    update_columns: [title, source, slug, text, document]
  }) {
   cdtn_id
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

/** @type {[string, (pkgName:string)=>Promise<import("./index.js").CdtnDocument[]>|void][]} */
const dataPackages = [
  ["@socialgouv/contributions-data", getContributionsDocuments],
  ["@socialgouv/kali-data", getAgreementDocuments],
  ["@socialgouv/legi-data", getCdtDocuments],
  ["@socialgouv/fiches-vdd", getFichesServicePublic],
  ["@socialgouv/fiches-travail-data", getFicheTravailEmploi],
  ["@socialgouv/datafiller-data", () => {}],
];
/**
 *
 * @param {string} pkgName
 * @param {string} pkgVersion
 */
async function getPackage(pkgName, pkgVersion = "latest") {
  const pkgInfo = await got(
    `http://registry.npmjs.org/${pkgName}/${pkgVersion}`
  ).json();
  const url = pkgInfo.dist.tarball;
  const latest = pkgInfo.version;
  if (await isPkgOutdated(pkgName, latest)) {
    await download(pkgName, url);
  }
}

/**
 *
 * @param {ingester.CdtnDocument} doc
 * @returns {Promise<string>}
 */
async function insertDocument(doc) {
  const { id, title, text, slug, source, ...document } = doc;
  const result = await client
    .mutation(insertDocumentsMutation, {
      document: {
        cdtn_id: generateCdtnId(`${source}${id}`),
        document,
        initial_id: id,
        meta_description: document.description || "",
        slug,
        source,
        text,
        title,
      },
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    throw new Error(`insert document alert ${title}`);
  }
  return result.data.document.cdtn_id;
}

async function main() {
  for (const [pkgName] of dataPackages) {
    await getPackage(pkgName);
  }
  if (args.dryRun) {
    console.log("dry-run mode");
  }
  /** @type {({status:"fulfilled", value:string}|{status: "rejected", reason:Object})[]} */
  let ids = [];
  for (const [pkgName, getDocument] of dataPackages) {
    const documents = await getDocument(pkgName);
    if (args.dryRun || !documents) {
      continue;
    }
    console.log(`ready to ingest ${pkgName}`);
    const inserts = await batchPromises(documents, insertDocument, 10);
    ids = ids.concat(inserts);
  }
  return ids;
}

main()
  .then((data) => {
    const fullfilledInserts = /**@type {{status:"fulfilled", value:string}[]} */ (data.filter(
      ({ status }) => status === "fulfilled"
    ));
    const rejectedInsert = data.filter(({ status }) => status === "rejected");
    console.log(`Finish ingest ${fullfilledInserts.length} documents`);
    if (rejectedInsert.length) {
      console.log(` fail to ingest ${fullfilledInserts.length} documents`);
    }
  })
  .catch(console.error);
