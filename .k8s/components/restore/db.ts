import env from "@kosko/env";
import { ok } from "assert";

import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";

ok(process.env.BACKUP_DB_NAME);
ok(process.env.BACKUP_DB_OWNER);
ok(process.env.BACKUP_DB_FILE);

const manifests = restoreDbJob({
  project: "cdtn-admin",
  env: [
    new EnvVar({
      name: "PGDATABASE",
      value: process.env.BACKUP_DB_NAME,
    }),
    new EnvVar({
      name: "OWNER",
      value: process.env.BACKUP_DB_OWNER,
    }),
    new EnvVar({
      name: "FILE",
      value: process.env.BACKUP_DB_FILE,
    }),
  ],
});

export default manifests;
