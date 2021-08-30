//

import { getDefaultPgParams } from "@socialgouv/kosko-charts/components/azure-pg";
import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";
import fs from "fs";
import { ok } from "assert";
import { EnvVar, PersistentVolume } from "kubernetes-models/v1";

import path from "path";

const pgParams = getDefaultPgParams();

const manifests = restoreDbJob({
  env: [
    new EnvVar({
      name: "PGDATABASE",
      value: pgParams.database,
    }),
    new EnvVar({
      name: "OWNER",
      value: pgParams.user,
    }),
    new EnvVar({
      name: "FILE",
      value: "hasura_prod_db.psql.gz",
    }),
  ],
  postRestoreScript: fs
    .readFileSync(path.join(__dirname, "./post-restore.sql"))
    .toString()
    .replace("${PGDATABASE}", pgParams.database),
  project: "cdtn-admin",
});

//
// HACK(douglasduteil): manully rename the shareName inside the pv
// Since July 2021, the shareName and the storage account have change
// This is a temporal hack to ensure that the restore db is pointing to the right backup folder...
//
const pv = manifests.find(
  (manifest) => manifest.kind === "PersistentVolume"
) as PersistentVolume;
ok(pv.spec, "Missing spec on pv");
ok(pv.spec.azureFile, "Missing spec on pv");
pv.spec.azureFile.shareName = "cdtnadminprodserver-backup-restore";

export default manifests;
