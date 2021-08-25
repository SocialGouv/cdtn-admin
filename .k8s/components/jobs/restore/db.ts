//

import { getDefaultPgParams } from "@socialgouv/kosko-charts/components/azure-pg";
import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";
import fs from "fs";
import { EnvVar } from "kubernetes-models/v1";

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
export default manifests;
