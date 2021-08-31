//

import { getDefaultPgParams } from "@socialgouv/kosko-charts/components/azure-pg";
import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";
import fs from "fs";
import { ok } from "assert";
import {
  EnvVar,
  IConfigMap,
  IPersistentVolumeClaim,
  PersistentVolume,
} from "kubernetes-models/v1";
import environments from "@socialgouv/kosko-charts/environments";

import path from "path";
import { IJob } from "kubernetes-models/_definitions/IoK8sApiBatchV1Job";

export default () => {
  const ciEnv = environments(process.env);

  if (!ciEnv.isProduction) {
    // HACK(douglasduteil): only run on production cluster
    return;
  }
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

  return manifests;
};
