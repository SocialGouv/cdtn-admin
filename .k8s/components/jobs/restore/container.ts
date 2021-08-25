import { restoreContainerJob } from "@socialgouv/kosko-charts/components/azure-storage/restore-container.job";
import environments from "@socialgouv/kosko-charts/environments";
import { ok } from "assert";
import { EnvVar } from "kubernetes-models/v1";
import env from "@kosko/env";

const envParams = environments(process.env);

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
ok(job.metadata, "Missing job metadata");
job.metadata.name = `restore-container-${envParams.branchSlug}`;
job.metadata.labels = envParams.metadata.labels || {};
job.metadata.labels.component =
  process.env.COMPONENT || `restore-${envParams.branchSlug}`;
job.metadata.annotations = {
  "kapp.k14s.io/update-strategy": "always-replace",
};
ok(job.spec, "Missing job spec");
ok(job.spec.template!.metadata, "Missing job spec template metadata");
job.spec.template.metadata.annotations = {
  "kapp.k14s.io/deploy-logs": "for-new-or-existing",
};
export default job;
