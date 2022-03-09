import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/hasura";
import { getHarborImagePath } from "@socialgouv/kosko-charts/utils/getHarborImagePath";

export default create("hasura", {
  config: {
    image: getHarborImagePath({ name: "cdtn-admin-hasura" }),
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
