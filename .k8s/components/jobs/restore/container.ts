import { restoreContainerJob } from "@socialgouv/kosko-charts/components/azure-storage/restore-container.job";
import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { GITLAB_LIKE_ENVIRONMENT_SLUG } from "../../../utils/GITLAB_LIKE_ENVIRONMENT_SLUG";

const job = restoreContainerJob({
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
job.metadata!.name = `restore-container-${GITLAB_LIKE_ENVIRONMENT_SLUG}`;

export default job;
