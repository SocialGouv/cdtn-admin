import env from "@kosko/env";
import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";
import { ok } from "assert";
import fs from "fs";
import { EnvVar } from "kubernetes-models/v1/EnvVar";
import path from "path";

ok(process.env.BACKUP_DB_NAME);
ok(process.env.BACKUP_DB_OWNER);
ok(process.env.BACKUP_DB_FILE);

const manifests = restoreDbJob({
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
  postRestoreScript: fs
    .readFileSync(path.join(__dirname, "./post-restore.sql"))
    .toString(),
  project: "cdtn-admin",
});

// override initContainer PGDATABASE/PGPASSWORD because this project pipeline use the legacy `db_SHA` convention instead of `autodevops_SHA`
const job = manifests.find((m) => m.kind === "Job");
if (job) {
  //@ts-expect-error
  const initContainer = job.spec.template.spec.initContainers[0];
  initContainer.env.find((e: EnvVar) => e.name === "PGDATABASE").value =
    process.env.BACKUP_DB_NAME;
  initContainer.env.find(
    (e: EnvVar) => e.name === "PGPASSWORD"
  ).value = `pass_${process.env.CI_COMMIT_SHORT_SHA}`;
}

export default manifests;
