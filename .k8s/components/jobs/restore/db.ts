//

import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";
import { ok } from "assert";
import fs from "fs";
import env from "@kosko/env";
import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { Job } from "kubernetes-models/batch/v1/Job";
import path from "path";

ok(process.env.CI_ENVIRONMENT_SLUG);

const suffix = process.env.CI_ENVIRONMENT_SLUG.replace(/-/g, "");

const manifests = restoreDbJob({
  env: [
    new EnvVar({
      name: "PGDATABASE",
      value: `db_${suffix}`,
    }),
    new EnvVar({
      name: "OWNER",
      value: `user_${suffix}`,
    }),
    new EnvVar({
      name: "FILE",
      value: "hasura_prod_db.psql.gz",
    }),
  ],
  postRestoreScript: fs
    .readFileSync(path.join(__dirname, "./post-restore.sql"))
    .toString(),
  project: "cdtn-admin",
});

// override initContainer PGDATABASE/PGPASSWORD because this project pipeline use the legacy `db_SHA` convention instead of `autodevops_SHA`
const job = manifests.find<Job>((m): m is Job => m.kind === "Job");
ok(
  job?.spec?.template.spec?.initContainers![0].env,
  "Missing initContainer definition"
);

const initContainer = job.spec.template.spec.initContainers[0];
const pgDatabaseEnvVar = initContainer.env?.find(
  (e) => e.name === "PGDATABASE"
);
ok(pgDatabaseEnvVar, "Missing PGDATABASE variable");
pgDatabaseEnvVar.value = `db_${suffix}`;
const pgPasswordEnvVar = initContainer.env?.find(
  (e) => e.name === "PGPASSWORD"
);
ok(pgPasswordEnvVar, "Missing PGPASSWORD variable");
pgPasswordEnvVar.value = `pass_${suffix}`;

export default env.env === "prod" ? manifests : [];
