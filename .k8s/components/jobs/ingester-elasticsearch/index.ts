import env from "@kosko/env";
import type { SealedSecret } from "@kubernetes-models/sealed-secrets/bitnami.com/v1alpha1/SealedSecret";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { getHarborImagePath } from "@socialgouv/kosko-charts/utils";
import { merge } from "@socialgouv/kosko-charts/utils/@kosko/env/merge";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import { updateMetadata } from "@socialgouv/kosko-charts/utils/updateMetadata";
import { ok } from "assert";
import { Job } from "kubernetes-models/batch/v1";
import type { ConfigMap } from "kubernetes-models/v1";
import { ES_INDEX_PREFIX } from "../../../utils/ES_INDEX_PREFIX";

const target = process.env.INGESTER_ELASTICSEARCH_TARGET;
ok(target, "Missing INGESTER_ELASTICSEARCH_TARGET");

ok(process.env.CI_REGISTRY_IMAGE, "Missing CI_REGISTRY_IMAGE");
const gitlabEnv = gitlab(process.env);
const name = `ingester-elasticsearch-${target}`;
const annotations = merge(gitlabEnv.annotations || {}, {
  "kapp.k14s.io/disable-default-ownership-label-rules": "",
  "kapp.k14s.io/disable-default-label-scoping-rules": "",
});
const labels = merge(gitlabEnv.labels || {}, {
  app: name,
});

const tag = process.env.CI_COMMIT_TAG
  ? process.env.CI_COMMIT_TAG.slice(1)
  : process.env.CI_COMMIT_SHA;

export default async () => {
  const configMap = await loadYaml<ConfigMap>(
    env,
    `ingester-elasticsearch/${target}.configmap.yaml`
  );
  ok(configMap, `Missing ingester-elasticsearch/${target}.configmap.yaml`);
  const secret = await loadYaml<SealedSecret>(
    env,
    `ingester-elasticsearch/${target}.sealed-secret.yaml`
  );
  updateMetadata(configMap, {
    namespace: gitlabEnv.namespace,
    annotations,
    labels,
  });
  ok(secret, `Missing ingester-elasticsearch/${target}.sealed-secret.yaml`);
  updateMetadata(secret, {
    namespace: gitlabEnv.namespace,
    annotations,
    labels,
  });

  //

  const job = new Job({
    metadata: {
      annotations: merge(annotations, {
        "kapp.k14s.io/update-strategy": "fallback-on-replace",
      }),
      labels,
      name,
      namespace: gitlabEnv.namespace.name,
    },
    spec: {
      backoffLimit: 0,
      template: {
        metadata: {
          name,
          annotations: merge(annotations, {
            "kapp.k14s.io/deploy-logs": "for-new-or-existing",
          }),
          labels,
        },
        spec: {
          containers: [
            {
              name: `ingester-elasticsearch-target-${target}`,
              image: getHarborImagePath({
                name: "cdtn-admin-ingester-elasticsearch",
              }),
              imagePullPolicy: "IfNotPresent",
              resources: {
                limits: {
                  cpu: "2",
                  memory: "2Gi",
                },
                requests: {
                  cpu: "1",
                  memory: "1Gi",
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
  return [configMap, secret, job];
};
