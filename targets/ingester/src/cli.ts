import { client } from "@shared/graphql-client";
import { generateCdtnId } from "@shared/id-generator";
import { access, readFile } from "fs/promises";
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
import getAgreementDocuments from "./transform/agreements/index";
import getCdtDocuments from "./transform/code-du-travail";
import getContributionsDocuments from "./transform/contributions";
import getFicheTravailEmploi from "./transform/fiche-travail-emploi";
import getFichesServicePublic from "./transform/fichesServicePublic/index";

const args = yargs(process.argv)
  .command("ingest", "ingest document into database")
  .example("$0 ingest --dry-run", "count the lines in the given file")
  .alias("d", "dry-run")
  .describe("d", "dry run mode")
  .help().argv;

type Versionnable = {
  version: string;
};
type PackageInfo = Versionnable & {
  dist: {
    tarball: string;
  };
};

const getPackageVersionQuery = `
query package_version ($repository: String!) {
  packageVersion: package_version_by_pk(repository: $repository) {
    version
  }
}
`;
type PackageVersionResult = {
  packageVersion?: Versionnable;
};

const updateDocumentAvailability = `
mutation update_documents($source: String!) {
  documents: update_documents(_set: {is_available: false}, where: {source: {_eq: $source}, is_available: {_eq: true}}) {
    affected_rows
  }
}
`;

type UpdateDocumentAvailabilityResult = {
  documents: {
    affected_rows: number;
  };
};

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

type InsertdocumentResult = {
  documents: { returning: { cdtn_id: string }[] };
};

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

type UpsertPackageVersionResult = {
  version: {
    repository: string;
    version: string;
  };
};

function getPkgPath(pkgName: string) {
  return path.join(process.cwd(), "data", pkgName);
}

async function isPkgOutdated(pkgName: string, latest: string) {
  const pkgInfoPath = path.join(getPkgPath(pkgName), "package.json");
  try {
    await access(pkgInfoPath);
    const pkgData = (await readFile(pkgInfoPath)).toString();
    const pkgInfo = JSON.parse(pkgData) as Versionnable;
    return semver.lt(pkgInfo.version, latest);
  } catch {
    console.error(`[isPkgOutdated] ${pkgName} not found, download a fresh one`);
    return true;
  }
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
  {
    getDocuments: getContributionsDocuments,
    pkgName: "@socialgouv/contributions-data",
  },
  { getDocuments: getAgreementDocuments, pkgName: "@socialgouv/kali-data" },
  { getDocuments: getCdtDocuments, pkgName: "@socialgouv/legi-data" },
  { getDocuments: getFichesServicePublic, pkgName: "@socialgouv/fiches-vdd" },
  {
    getDocuments: getFicheTravailEmploi,
    pkgName: "@socialgouv/fiches-travail-data",
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

async function getLastIngestedVersion(pkgName: string) {
  const result = await client
    .query<PackageVersionResult>(getPackageVersionQuery, {
      repository: pkgName,
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    throw new Error(`error while retrieving ingester packages version`);
  }
  if (result.data !== undefined) {
    return result.data.packageVersion?.version;
  }
}

async function insertDocuments(docs: ingester.CdtnDocument[]) {
  const result = await client
    .mutation<InsertdocumentResult>(insertDocumentsMutation, {
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
  if (result.data) {
    return result.data.documents.returning;
  }
  return [];
}

async function initDocAvailabity(source: string) {
  console.time(` initDocAvailabity ${source}`);
  const result = await client
    .mutation<UpdateDocumentAvailabilityResult>(updateDocumentAvailability, {
      source,
    })
    .toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error(`error initializing documents availability`);
  }
  console.timeEnd(` initDocAvailabity ${source}`);
  if (!result.data) {
    throw new Error(`no data received for documents availability`);
  }
  const nbDocs = result.data.documents.affected_rows;
  console.log(` > updated availability of ${nbDocs} documents`);
  return nbDocs;
}

async function updateVersion(repository: string, version: string) {
  const result = await client
    .mutation<UpsertPackageVersionResult>(insertPackageVersionMutation, {
      object: { repository, version },
    })
    .toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error(`error updating package_version ${repository}@${version}`);
  }
  if (!result.data) {
    throw new Error(
      `no data received for update version of ${repository}@${version}`
    );
  }
  return result.data.version;
}

async function main() {
  const packagesToUpdate = new Map<
    string,
    {
      getDocuments: (pkgName: string) => Promise<CdtnDocument[]>;
      version: string;
    }
  >();
  for (const { pkgName, getDocuments } of dataPackages) {
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
