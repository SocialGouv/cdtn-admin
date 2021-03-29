import { restoreContainerJob } from "@socialgouv/kosko-charts/components/azure-storage/restore-container.job";
import { EnvVar } from "kubernetes-models/v1/EnvVar";

const manifests = restoreContainerJob({
  env: [
    new EnvVar({
      name: "SOURCE_CONTAINER",
      value: "cdtn",
    }),
    new EnvVar({
      name: "DESTINATION_CONTAINER",
      value: "cdtn-dev",
    }),
  ],
  from: "dev",
  project: "cdtn-admin",
  to: "dev",
});

export default manifests;
