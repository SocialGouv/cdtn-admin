//

import { getDefaultPgParams } from "@socialgouv/kosko-charts/components/azure-pg";
import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";
import fs from "fs";
import env from "@kosko/env";
import { ok } from "assert";
import {
  EnvVar,
  IConfigMap,
  IPersistentVolumeClaim,
  ISecret,
  PersistentVolume,
} from "kubernetes-models/v1";
import { IJob } from "kubernetes-models/batch/v1";
import environments from "@socialgouv/kosko-charts/environments";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";

import path from "path";

export default async () => {
  const ciEnv = environments(process.env);

  if (env.env !== "prod") {
    // HACK(douglasduteil): only run on production cluster
    return;
  }

  const secret = await loadYaml<ISecret>(
    env,
    `restore/pg-backup.sealed-secret.yaml`
  );
  ok(secret, "Missing restore/pg-backup.sealed-secret.yaml");
  ok(secret.metadata, "Missing secret.metadata");
  ok(secret.metadata.name, "Missing secret.metadata.name");

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
  ok(pv, "Missing pv");

  ok(pv.metadata, "Missing metadata on pv");
  pv.metadata.namespace = ciEnv.metadata.namespace.name;

  ok(pv.spec, "Missing spec on pv");
  ok(pv.spec.azureFile, "Missing spec on pv");
  pv.spec.azureFile.secretName = secret.metadata.name;
  pv.spec.azureFile.secretNamespace = ciEnv.metadata.namespace.name;
  pv.spec.azureFile.shareName = "cdtnadminprodserver-backup-restore";

  //
  // HACK(douglasduteil): manully change the container namespace
  const pvc = manifests.find(
    (manifest) => manifest.kind === "PersistentVolumeClaim"
  ) as IPersistentVolumeClaim;
  ok(pvc, "Missing pvc");
  ok(pvc.metadata, "Missing metadata on pvc");
  pvc.metadata.namespace = ciEnv.metadata.namespace.name;

  //
  // HACK(douglasduteil): manully change the container namespace
  const configmap = manifests.find(
    (manifest) => manifest.kind === "ConfigMap"
  ) as IConfigMap;
  ok(configmap, "Missing configmap");
  ok(configmap.metadata, "Missing metadata on configmap");
  configmap.metadata.namespace = ciEnv.metadata.namespace.name;

  //
  // HACK(douglasduteil): manully change the container namespace
  const job = manifests.find((manifest) => manifest.kind === "Job") as IJob;
  ok(job, "Missing job");
  ok(job.metadata, "Missing metadata on job");
  job.metadata.namespace = ciEnv.metadata.namespace.name;

  return manifests.concat([secret]);
};
