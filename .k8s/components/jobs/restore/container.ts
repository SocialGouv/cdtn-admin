import { restoreContainerJob } from "@socialgouv/kosko-charts/components/azure-storage/restore-container.job";
import { EnvVar } from "kubernetes-models/v1";
import env from "@kosko/env";

const params = env.component("container");

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
export default job;
