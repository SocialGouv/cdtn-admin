import env from "@kosko/env";
import type { SealedSecret } from "@kubernetes-models/sealed-secrets/bitnami.com/v1alpha1/SealedSecret";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { merge } from "@socialgouv/kosko-charts/utils/@kosko/env/merge";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import { ok } from "assert";
import type { ConfigMap } from "kubernetes-models/_definitions/IoK8sApiCoreV1ConfigMap";
import { Job } from "kubernetes-models/batch/v1/Job";

import { ES_INDEX_PREFIX } from "../../../utils/ES_INDEX_PREFIX";

const target = process.env.INGESTER_ELASTICSEARCH_TARGET;
ok(target, "Missing INGESTER_ELASTICSEARCH_TARGET");

ok(process.env.CI_REGISTRY_IMAGE, "Missing CI_REGISTRY_IMAGE");

const configMap = loadYaml<ConfigMap>(
  env,
  `ingester-elasticsearch/${target}-configmap.yaml`
);
ok(configMap, `Missing ingester-elasticsearch/${target}-configmap.yaml`);
const secret = loadYaml<SealedSecret>(
  env,
  `ingester-elasticsearch/${target}-sealed-secret.yaml`
);
ok(secret, `Missing ingester-elasticsearch/${target}-sealed-secret.yaml`);

const envParams = merge(gitlab(process.env), {});

const tag = process.env.CI_COMMIT_TAG
  ? process.env.CI_COMMIT_TAG.slice(1)
  : process.env.CI_COMMIT_SHA;

const job = new Job({
  metadata: {
    name: `ingester-elasticsearch-target-${target}`,
    namespace: envParams.namespace.name,
  },
  spec: {
    backoffLimit: 0,
    template: {
      spec: {
        containers: [
          {
            name: `ingester-elasticsearch-target-${target}`,
            image: `${process.env.CI_REGISTRY_IMAGE}/ingester-elasticsearch:${tag}`,
            imagePullPolicy: "IfNotPresent",
            resources: {
              limits: {
                cpu: "2",
                memory: "1Gi",
              },
              requests: {
                cpu: "1",
                memory: "512Mi",
              },
            },
            envFrom: [
              {
                configMapRef: {
                  name: configMap?.metadata?.name,
                },
              },
              {
                secretRef: {
                  name: secret?.metadata?.name,
                },
              },
            ],
            env: [
              {
                name: "ES_INDEX_PREFIX",
                value: ES_INDEX_PREFIX,
              },
            ],
          },
        ],
        restartPolicy: "Never",
      },
    },
    ttlSecondsAfterFinished: 86400,
  },
});

export default [configMap, secret, job];
