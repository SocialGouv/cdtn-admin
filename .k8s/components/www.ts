import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/app";
import { getDeployment } from "@socialgouv/kosko-charts/utils/getDeployment";

import { getHarborImagePath } from "@socialgouv/kosko-charts/utils/getHarborImagePath";
import { Deployment } from "kubernetes-models/_definitions/IoK8sApiAppsV1Deployment";

export default async () => {
  const manifests = await create("www", {
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

  const deployment = getDeployment(
    manifests as {
      apiVersion: string;
      kind: string;
    }[]
  );
  if (deployment && deployment.spec) {
    deployment.spec.replicas = 3;
  }

  return manifests;
};
