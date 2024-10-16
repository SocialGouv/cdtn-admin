import getUri from "get-uri";
import got from "got";
import gunzip from "gunzip-maybe";
import pRetry from "p-retry";
import path from "path";
import * as semver from "semver";
import * as tar from "tar-fs";
import yargs from "yargs";
import * as unzipper from "unzipper";
import { promises as fs } from "fs";
import { createWriteStream } from "fs";

import type { CdtnDocument } from ".";
import { updateKaliArticles, updateLegiArticles } from "./articles";
import { batchPromises, chunk } from "./lib/batchPromises";
import {
  getLastIngestedVersion,
  initDocAvailabity,
  insertDocuments,
  updateVersion,
} from "./lib/hasura-mutations-queries";
import getFicheTravailEmploi from "./transform/fiche-travail-emploi";
import getFichesServicePublic from "./transform/fichesServicePublic/index";
import getCdtDocuments from "./transform/legi-data/index";

interface Args {
  dryRun: unknown;
}

const args: Args = yargs(process.argv)
  .command("ingest", "ingest document into database")
  .example("$0 ingest --dry-run", "count the lines in the given file")
  .alias("d", "dry-run")
  .describe("d", "dry run mode")
  .help().argv as unknown as Args;

interface Versionnable {
  version: string;
}

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
              header.name = header.name.replace(
                pkgName === "@socialgouv/fiches-travail-data"
                  ? "fiches-travail-data-test-mt-dsfr/"
                  : "package/",
                ""
              );
              return header;
            },
          })
        )
        .on("finish", resolve);
    });
  });
}

async function downloadZip(pkgName: string, url: string) {
  return new Promise((resolve, reject) => {
    getUri(url, async function (err, rs) {
      if (err || !rs) {
        reject(`Error while downloading package ${pkgName} - ${url}`);
        return;
      }

      const outputDir = getPkgPath(pkgName);

      await fs.mkdir(outputDir, { recursive: true });

      rs.pipe(unzipper.Parse())
        .on("entry", function (entry) {
          const filePath = entry.path.replace(
            "fiches-travail-data-test-mt-dsfr/",
            ""
          );

          const outputPath = path.join(outputDir, filePath);

          if (entry.type === "Directory") {
            fs.mkdir(outputPath, { recursive: true }).catch(reject);
            entry.autodrain();
          } else {
            entry.pipe(createWriteStream(outputPath)).on("error", reject);
          }
        })
        .on("finish", resolve)
        .on("error", (error) => {
          reject(
            `Error while extracting package ${pkgName} - ${error.message}`
          );
        });
    });
  });
}

const dataPackages = [
  { getDocuments: getCdtDocuments, pkgName: "@socialgouv/legi-data" },
  {
    getDocuments: getFichesServicePublic,
    pkgName: "@socialgouv/fiches-vdd",
    disableSlugUpdate: true,
  },
  {
    getDocuments: getFicheTravailEmploi,
    pkgName: "@socialgouv/fiches-travail-data",
    disableSlugUpdate: true,
  },
  {
    getDocuments: undefined,
    pkgName: "@socialgouv/kali-data",
  },
];

async function getPackageInfo(pkgName: string) {
  if (pkgName === "@socialgouv/fiches-travail-data") {
    return {
      url: "https://github.com/SocialGouv/fiches-travail-data/archive/refs/heads/test-mt-dsfr.zip",
      version: "v4.700.1",
    };
  }
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
      getDocuments?: (pkgName: string) => Promise<CdtnDocument[]>;
      version: string;
      disableSlugUpdate: boolean;
    }
  >();
  for (const { pkgName, disableSlugUpdate, getDocuments } of dataPackages) {
    const pkgInfo = await getPackageInfo(pkgName);
    if (pkgName === "@socialgouv/fiches-travail-data") {
      await downloadZip(pkgName, pkgInfo.url);
    } else {
      await download(pkgName, pkgInfo.url);
    }

    const ingestedVersion = await getLastIngestedVersion(pkgName);
    if (
      (ingestedVersion && semver.gt(pkgInfo.version, ingestedVersion)) ||
      !ingestedVersion
    ) {
      packagesToUpdate.set(pkgName, {
        getDocuments,
        version: pkgInfo.version,
        disableSlugUpdate: disableSlugUpdate ?? false,
      });
    }
  }

  if (args.dryRun) {
    console.log("dry-run mode");
  }
  let ids: { cdtn_id: string }[] = [];
  console.log(`packages to ingest: ${[...packagesToUpdate.keys()]}`);
  for (const [
    pkgName,
    { version, getDocuments, disableSlugUpdate },
  ] of packagesToUpdate) {
    console.log(`Start package: ${pkgName}`);
    if (!getDocuments) {
      console.log(`Get document not defined, skip it !`);
      continue;
    }
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
          pRetry(async () => insertDocuments(docs, disableSlugUpdate), {
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

  if (packagesToUpdate.get("@socialgouv/legi-data")) {
    console.log("update legi articles");
    await updateLegiArticles();
  }
  if (packagesToUpdate.get("@socialgouv/kali-data")) {
    console.log("update kali articles");
    await updateKaliArticles();
  }
  return ids;
}

main()
  .then((data) => {
    console.log(`Finish ingest ${data.length} documents`);
  })
  .catch((err) => {
    console.info("Failed :(");
    console.error(err);
    process.exit(1);
  });
