import getUri from "get-uri";
import got from "got";
import gunzip from "gunzip-maybe";
import pRetry from "p-retry";
import path from "path";
import * as semver from "semver";
import * as tar from "tar-fs";
import yargs from "yargs";

import type { CdtnDocument } from ".";
import { batchPromises, chunk } from "./lib/batchPromises";
import {
  getLastIngestedVersion,
  initDocAvailabity,
  insertDocuments,
  updateVersion,
} from "./lib/hasura-mutations-queries";
import { updateKaliArticles, updateLegiArticles } from "./references";
import getAgreementDocuments from "./transform/agreements";
import getContributionsDocuments from "./transform/contributions";
import getFicheTravailEmploi from "./transform/fiche-travail-emploi";
import getFichesServicePublic from "./transform/fichesServicePublic/index";
import getCdtDocuments from "./transform/legi-data/index";

type Args = {
  dryRun: unknown;
};
const args: Args = yargs(process.argv)
  .command("ingest", "ingest document into database")
  .example("$0 ingest --dry-run", "count the lines in the given file")
  .alias("d", "dry-run")
  .describe("d", "dry run mode")
  .help().argv as unknown as Args;

type Versionnable = {
  version: string;
};
type PackageInfo = Versionnable & {
  dist: {
    tarball: string;
  };
};

function getPkgPath(pkgName: string) {
  return path.join(process.cwd(), "data", pkgName);
}

async function download(pkgName: string, url: string) {
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

const dataPackages = [
  { getDocuments: getCdtDocuments, pkgName: "@socialgouv/legi-data" },
  { getDocuments: getFichesServicePublic, pkgName: "@socialgouv/fiches-vdd" },
  {
    getDocuments: getFicheTravailEmploi,
    pkgName: "@socialgouv/fiches-travail-data",
  },
  {
    forceUpdate: true,
    getDocuments: getContributionsDocuments,
    pkgName: "@socialgouv/contributions-data",
  },
  {
    forceUpdate: true,
    getDocuments: getAgreementDocuments,
    pkgName: "@socialgouv/kali-data",
  },
];

async function getPackageInfo(pkgName: string) {
  const pkgInfo: PackageInfo = await got(
    `http://registry.npmjs.org/${pkgName}/latest`
  ).json();

  return {
    url: pkgInfo.dist.tarball,
    version: pkgInfo.version,
  };
}

async function main() {
  const packagesToUpdate = new Map<
    string,
    {
      getDocuments: (pkgName: string) => Promise<CdtnDocument[]>;
      version: string;
    }
  >();
  for (const { pkgName, forceUpdate, getDocuments } of dataPackages) {
    const pkgInfo = await getPackageInfo(pkgName);
    await download(pkgName, pkgInfo.url);

    const ingestedVersion = await getLastIngestedVersion(pkgName);
    if (
      forceUpdate ||
      (ingestedVersion && semver.gt(pkgInfo.version, ingestedVersion)) ||
      !ingestedVersion
    ) {
      packagesToUpdate.set(pkgName, { getDocuments, version: pkgInfo.version });
    }
  }

  // @ts-expect-error type généré
  if (args.dryRun) {
    console.log("dry-run mode");
  }
  let ids: { cdtn_id: string }[] = [];
  console.log(`packages to ingest: ${[...packagesToUpdate.keys()]}`);
  for (const [pkgName, { version, getDocuments }] of packagesToUpdate) {
    console.time(`update ${pkgName}`);
    console.time(` getDocuments ${pkgName}`);
    const documents = await getDocuments(pkgName);
    console.timeEnd(` getDocuments ${pkgName}`);
    console.log(` ${pkgName}: ${documents.length} documents`);
    if (!args.dryRun && documents.length > 0) {
      await initDocAvailabity(documents[0].source);
      console.log(
        ` ready to ingest ${documents.length} documents from ${pkgName}`
      );
      const chunks = chunk(documents, 50);
      const inserts = await batchPromises(
        chunks,
        async (docs) =>
          pRetry(async () => insertDocuments(docs), {
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
      await updateVersion(pkgName, version);
    }
  }

  await updateLegiArticles();
  await updateKaliArticles();
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
