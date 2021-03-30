import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/hasura";
import { getDeployment } from "@socialgouv/kosko-charts/utils/getDeployment";
import { ok } from "assert";
import { GITLAB_LIKE_ENVIRONMENT_SLUG } from "../utils/GITLAB_LIKE_ENVIRONMENT_SLUG";

const manifests = create({
  config: {
    container: {
      resources: {
        limits: {
          cpu: "1000m",
          memory: "1.5Gi",
        },
      },
    },
  },
  env,
});

if (env.env === "dev") {
  // HACK(douglasduteil): provide one db per env
  // The CI_ENVIRONMENT_SLUG is the most useful for this
  const pgSecretRefName = `azure-pg-user-${GITLAB_LIKE_ENVIRONMENT_SLUG.replace(
    /-/g,
    ""
  )}`;

  //

  const deployment = getDeployment(
    manifests as {
      apiVersion: string;
      kind: string;
    }[]
  );
  ok(deployment.spec?.template.spec?.containers[0].envFrom![0].secretRef?.name);
  ok(
    deployment.spec.template.spec.initContainers![0].envFrom![0].secretRef?.name
  );
  deployment.spec.template.spec.containers[0].envFrom[0].secretRef.name = pgSecretRefName;
  deployment.spec.template.spec.initContainers![0].envFrom![0].secretRef.name = pgSecretRefName;
}
export default manifests;
