import { restoreContainerJob } from "@socialgouv/kosko-charts/components/azure-storage/restore-container.job";
import environments from "@socialgouv/kosko-charts/environments";
import { EnvVar } from "kubernetes-models/v1";
import { GITLAB_LIKE_ENVIRONMENT_SLUG } from "../../../utils/GITLAB_LIKE_ENVIRONMENT_SLUG";

const envParams = environments(process.env);

const job = restoreContainerJob({
  env: [
    new EnvVar({
      name: "SOURCE_CONTAINER",
      value: "cdtn",
    }),
    new EnvVar({
      name: "DESTINATION_CONTAINER",
      value: "cdtn",
    }),
  ],
  from: "dev",
  project: "cdtn-admin",
  to: "prod",
});
job.metadata!.name = `restore-container-${GITLAB_LIKE_ENVIRONMENT_SLUG}`;
job.metadata!.labels = envParams.metadata.labels || {};
job.metadata!.labels.component =
  process.env.COMPONENT || `restore-${process.env.CI_COMMIT_REF_SLUG}`;
job.metadata!.annotations = {
  "kapp.k14s.io/update-strategy": "always-replace",
};
job.spec!.template!.metadata!.annotations = {
  "kapp.k14s.io/deploy-logs": "for-new-or-existing",
};
export default job;
