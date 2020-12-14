import env from "@kosko/env";

import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { restoreContainerJob } from "@socialgouv/kosko-charts/components/azure-storage/restore-container.job";

const manifests = restoreContainerJob({
  env: [
    new EnvVar({
      name: "SOURCE_CONTAINER",
      value: "prod-files1",
    }),
    new EnvVar({
      name: "DESTINATION_CONTAINER",
      value: "dev-files2",
    }),
  ],
  project: "cdtn-admin",
  from: "prod",
  to: "dev",
});

export default manifests;
