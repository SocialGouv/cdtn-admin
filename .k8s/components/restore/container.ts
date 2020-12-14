import env from "@kosko/env";
import { ok } from "assert";

import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { restoreContainerJob } from "@socialgouv/kosko-charts/components/azure-storage/restore-container.job";

ok(process.env.SOURCE_CONTAINER, process.env.DESTINATION_CONTAINER);

const manifests = restoreContainerJob({
  env: [
    new EnvVar({
      name: "SOURCE_CONTAINER",
      value: process.env.SOURCE_CONTAINER,
    }),
    new EnvVar({
      name: "DESTINATION_CONTAINER",
      value: process.env.DESTINATION_CONTAINER,
    }),
  ],
  project: "cdtn-admin",
  from: "prod",
  to: "dev",
});

export default manifests;
