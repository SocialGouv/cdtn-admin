import { restoreContainerJob } from "@socialgouv/kosko-charts/components/azure-storage/restore-container.job";
import { EnvVar } from "kubernetes-models/v1";
import { ok } from "assert";
import env from "@kosko/env";
import environments from "@socialgouv/kosko-charts/environments";

export default () => {
  const params = env.component("restore/container");
  const ciEnv = environments(process.env);

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
  job.metadata.namespace = ciEnv.metadata.namespace.name;
  return job;
};
