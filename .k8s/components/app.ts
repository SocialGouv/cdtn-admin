import env from "@kosko/env";
import { ok } from "assert";
import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { Deployment } from "kubernetes-models/apps/v1/Deployment";
import { Ingress } from "kubernetes-models/api/networking/v1beta1/Ingress";

import { IoK8sApiAppsV1Deployment } from "kubernetes-models/_definitions/IoK8sApiAppsV1Deployment";
import { IoK8sApiNetworkingV1beta1Ingress } from "kubernetes-models/_definitions/IoK8sApiNetworkingV1beta1Ingress";

import { create } from "@socialgouv/kosko-charts/components/app";
import { addEnv } from "@socialgouv/kosko-charts/utils/addEnv";
import { getManifestByKind } from "@socialgouv/kosko-charts/utils/getManifestByKind";
import { getIngressHost } from "@socialgouv/kosko-charts/utils/getIngressHost";

const manifests = create("app", {
  env,
  config: { containerPort: 3000 },
  deployment: {
    container: {
      resources: {
        requests: {
          cpu: "5m",
          memory: "128Mi",
        },
        limits: {
          cpu: "1000m",
          memory: "256Mi",
        },
      },
      livenessProbe: {
        httpGet: {
          path: "/health",
          port: "http",
        },
        initialDelaySeconds: 30,
        periodSeconds: 15,
      },
      readinessProbe: {
        httpGet: {
          path: "/health",
          port: "http",
        },
        initialDelaySeconds: 30,
        periodSeconds: 15,
      },
    },
  },
});

/* pass dynamic deployment URL as env var to the container */
//@ts-expect-error
const deployment = getManifestByKind(manifests, Deployment) as Deployment;

ok(deployment);

const frontendUrl = new EnvVar({
  name: "FRONTEND_URL",
  value: `https://${getIngressHost(manifests)}`,
});

addEnv({ deployment, data: frontendUrl });

export default manifests;
