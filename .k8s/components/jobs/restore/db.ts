//

import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";
import { ok } from "assert";
import fs from "fs";
import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { Job } from "kubernetes-models/batch/v1/Job";
import path from "path";
import { GITLAB_LIKE_ENVIRONMENT_SLUG } from "../../../utils/GITLAB_LIKE_ENVIRONMENT_SLUG";
import { PG_ENVIRONMENT_SLUG } from "../../../utils/PG_ENVIRONMENT_SLUG";

const suffix = PG_ENVIRONMENT_SLUG;

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
ok(job?.metadata, "Missing job metadata");
job.metadata.name = `restore-db-${GITLAB_LIKE_ENVIRONMENT_SLUG}`;
ok(
  job.spec?.template.spec?.initContainers![0].env,
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

export default manifests;
