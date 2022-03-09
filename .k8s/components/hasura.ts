import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/hasura";
import { getGithubRegistryImagePath } from "@socialgouv/kosko-charts/utils/getGithubRegistryImagePath";

export default create("hasura", {
  config: {
    image: getGithubRegistryImagePath({
      project: "cdtn-admin",
      name: "cdtn-admin-hasura",
    }),
    container: {
      resources: {
        limits: {
          cpu: "1000m",
          memory: "1.5Gi",
        },
        requests: {
          cpu: "10m",
          memory: "256Mi",
        },
      },
    },
  },
  env,
});
