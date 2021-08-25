//

import { getDevDatabaseParameters } from "@socialgouv/kosko-charts/components/azure-pg/params";
import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";
import environments from "@socialgouv/kosko-charts/environments";
import { generate } from "@socialgouv/kosko-charts/utils/environmentSlug";
import { ok } from "assert";
import fs from "fs";
import { Job } from "kubernetes-models/batch/v1";
import { EnvVar } from "kubernetes-models/v1";
import { ObjectMeta } from "kubernetes-models/apimachinery/pkg/apis/meta/v1";

import path from "path";

const envParams = environments(process.env);
const name = generate(`restore-db-${envParams.branch}`);
const pgParams = getDevDatabaseParameters({
  suffix: generate(envParams.branch),
});

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

(manifests as any as { metadata: ObjectMeta }[]).forEach((m) => {
  m.metadata = m.metadata || new ObjectMeta({});
  m.metadata.labels = m.metadata.labels || envParams.metadata.labels || {};
  m.metadata.labels.component = process.env.COMPONENT || name;
});

// override initContainer PGDATABASE/PGPASSWORD because this project pipeline use the legacy `db_SHA` convention instead of `autodevops_SHA`
const job = manifests.find<Job>((m): m is Job => m.kind === "Job");
ok(job?.metadata, "Missing job metadata");
job.metadata.name = name;
job.metadata!.annotations = {
  "kapp.k14s.io/update-strategy": "always-replace",
};
job.spec!.template!.metadata!.annotations = {
  "kapp.k14s.io/deploy-logs": "for-new-or-existing",
};

export default manifests;
