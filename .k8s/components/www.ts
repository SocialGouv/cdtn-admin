import { create } from "@socialgouv/kosko-charts/components/app";
import { createAutoscale } from "@socialgouv/kosko-charts/components/autoscale";
import env from "@kosko/env";
import { getDeployment } from "@socialgouv/kosko-charts/utils/getDeployment";

const manifests = create("www", {
  env,
  config: {
    containerPort: 3000,
    container: {
      resources: {
        requests: {
          cpu: "5m",
          memory: "560Mi",
        },
        limits: {
          cpu: "1000m",
          memory: "560Mi",
        },
      },
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
    },
  },
});

const deployment = getDeployment(manifests);

//

//

if (process.env.CI_COMMIT_TAG) {
  manifests.push(createAutoscale(deployment));
}

//

export default [...manifests];
