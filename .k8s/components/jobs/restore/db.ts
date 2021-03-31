//

import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";
import { ok } from "assert";
import fs from "fs";
import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { Job } from "kubernetes-models/batch/v1/Job";
import path from "path";
import { GITLAB_LIKE_ENVIRONMENT_SLUG } from "../../../utils/GITLAB_LIKE_ENVIRONMENT_SLUG";
import { PG_ENVIRONMENT_SLUG } from "../../../utils/PG_ENVIRONMENT_SLUG";
import { getDevDatabaseParameters } from "@socialgouv/kosko-charts/components/azure-pg/params";
import { getDefaultPgParams } from "@socialgouv/kosko-charts/components/azure-pg";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";

const suffix = PG_ENVIRONMENT_SLUG;
const pgParams = getDevDatabaseParameters({ suffix });
const gitlabEnv = gitlab(process.env);

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
    .toString(),
  project: "cdtn-admin",
});

manifests.forEach((m) => {
  m.metadata = m.metadata || {};
  m.metadata.labels = gitlabEnv.labels || {};
  m.metadata.labels.component =
    process.env.COMPONENT || `restore-${process.env.CI_COMMIT_REF_SLUG}`;
});

// override initContainer PGDATABASE/PGPASSWORD because this project pipeline use the legacy `db_SHA` convention instead of `autodevops_SHA`
const job = manifests.find<Job>((m): m is Job => m.kind === "Job");
ok(job?.metadata, "Missing job metadata");
job.metadata.name = `restore-db-${GITLAB_LIKE_ENVIRONMENT_SLUG}`;
job.metadata!.annotations = {
  "kapp.k14s.io/update-strategy": "always-replace",
};
job.spec!.template!.metadata!.annotations = {
  "kapp.k14s.io/deploy-logs": "for-new-or-existing",
};
ok(
  job.spec?.template.spec?.initContainers![0].env,
  "Missing initContainer definition"
);

const initContainer = job.spec.template.spec.initContainers[0];

const pgDatabaseEnvVar = initContainer.env?.find(
  (e) => e.name === "PGDATABASE"
);
ok(pgDatabaseEnvVar, "Missing PGDATABASE variable");
pgDatabaseEnvVar.value = pgParams.database;

const pgUserEnvVar = initContainer.env?.find((e) => e.name === "PGUSER");
const { host } = getDefaultPgParams();
ok(pgUserEnvVar, "Missing PGUSER variable");
pgUserEnvVar.value = `${pgParams.user}@${host}`;

const pgPasswordEnvVar = initContainer.env?.find(
  (e) => e.name === "PGPASSWORD"
);
ok(pgPasswordEnvVar, "Missing PGPASSWORD variable");
pgPasswordEnvVar.value = pgParams.password;

export default manifests;
