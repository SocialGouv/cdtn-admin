import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/app";
import { getHarborImagePath } from "@socialgouv/kosko-charts/utils/getHarborImagePath";

const asyncManifests = create("www", {
  config: {
    image: getHarborImagePath({ name: "cdtn-admin-frontend" }),
    container: {
      env: [
        {
          name: "COMMIT",
          value: process.env.CI_COMMIT_SHA,
        },
        {
          name: "FRONTEND_HOST",
          value: process.env.CI_ENVIRONMENT_URL,
        },
        {
          name: "VERSION",
          value: process.env.CI_COMMIT_REF_NAME,
        },
      ],
      resources: {
        limits: {
          cpu: "1000m",
          memory: "560Mi",
        },
        requests: {
          cpu: "5m",
          memory: "128Mi",
        },
      },
    },
    containerPort: 3000,
  },
  env,
});

export default asyncManifests