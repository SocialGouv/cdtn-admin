import { restoreContainerJob } from "@socialgouv/kosko-charts/components/azure-storage/restore-container.job";
import { EnvVar, ISecret } from "kubernetes-models/v1";
import { ok } from "assert";
import env from "@kosko/env";
import environments from "@socialgouv/kosko-charts/environments";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";

export default async () => {
  const params = env.component("restore/container");
  const ciEnv = environments(process.env);

  const secret = await loadYaml<ISecret>(
    env,
    `restore/azure-volumes.sealed-secret.yaml`
  );
  ok(secret, "Missing restore/azure-volumes.sealed-secret.yaml");

  const job = restoreContainerJob({
    env: [
      new EnvVar({
        name: "SOURCE_CONTAINER",
        value: "cdtn",
      }),
      new EnvVar({
        name: "DESTINATION_CONTAINER",
        value: params.container,
      }),
    ],
    from: "dev",
    project: "cdtn-admin",
    to: params.server,
  });

  //
  // HACK(douglasduteil): manully change the container namespace
  ok(job.metadata, "Missing spec on job");
  job.metadata.namespace = "cdtn-admin";
  return [job, secret];
};
