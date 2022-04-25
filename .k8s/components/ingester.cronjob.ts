import env from "@kosko/env";
import environments from "@socialgouv/kosko-charts/environments";
import { merge } from "@socialgouv/kosko-charts/utils/@kosko/env/merge";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import { getHarborImagePath } from "@socialgouv/kosko-charts/utils/getHarborImagePath";
import { updateMetadata } from "@socialgouv/kosko-charts/utils/updateMetadata";
import { ok } from "assert";
import { CronJob } from "kubernetes-models/batch/v1beta1";
import { ConfigMap, PersistentVolumeClaim, Secret } from "kubernetes-models/v1";

const envParams = environments(process.env);
const name = "ingester";
const annotations = merge(envParams.metadata.annotations || {}, {
  "kapp.k14s.io/disable-default-ownership-label-rules": "",
  "kapp.k14s.io/disable-default-label-scoping-rules": "",
});
const labels = merge(envParams.metadata.labels || {}, {
  app: name,
});

const tag = process.env.CI_COMMIT_TAG
  ? process.env.CI_COMMIT_TAG.slice(1)
  : process.env.CI_COMMIT_SHA;

const persistentVolumeClaim = new PersistentVolumeClaim({
  metadata: {
    annotations,
    labels,
    name,
    namespace: envParams.metadata.namespace.name,
  },
  spec: {
    accessModes: ["ReadWriteOnce"],
    resources: {
      requests: {
        storage: "2Gi",
      },
    },
    volumeMode: "Filesystem",
  },
});

export default async () => {
  const configMap = await loadYaml<ConfigMap>(env, `ingester.configmap.yaml`);
  ok(configMap, "Missing ingester.configmap.yaml");
  updateMetadata(configMap, {
    namespace: envParams.metadata.namespace,
    annotations,
    labels,
  });
  const secret = await loadYaml<Secret>(env, `ingester.sealed-secret.yaml`);
  ok(secret, "Missing ingester.sealed-secret.yaml");
  updateMetadata(secret, {
    namespace: envParams.metadata.namespace,
    annotations,
    labels,
  });

  const cronJob = new CronJob({
    metadata: {
      annotations,
      labels,
      name,
      namespace: envParams.metadata.namespace.name,
    },
    spec: {
      concurrencyPolicy: "Forbid",
      successfulJobsHistoryLimit: 3,
      failedJobsHistoryLimit: 3,
      schedule: "30 0 * * *",
      jobTemplate: {
        spec: {
          backoffLimit: 1,
          template: {
            metadata: {
              annotations: merge(annotations, {
                "kapp.k14s.io/deploy-logs": "for-new-or-existing",
              }),
              labels,
            },
            spec: {
              containers: [
                {
                  name: "update-ingester",
                  image: getHarborImagePath({ name: "cdtn-admin-ingester" }),
                  resources: {
                    requests: {
                      cpu: "1500m",
                      memory: "2.5Gi",
                    },
                    limits: {
                      cpu: "2000m",
                      memory: "3Gi",
                    },
                  },
                  workingDir: "/app",
                  env: [
                    ...(process.env.PRODUCTION
                      ? [
                          {
                            name: "PRODUCTION",
                            value: process.env.PRODUCTION,
                          },
                        ]
                      : []),
                  ],
                  envFrom: [
                    {
                      configMapRef: {
                        name: configMap.metadata?.name,
                      },
                    },
                    {
                      secretRef: {
                        name: secret?.metadata?.name,
                      },
                    },
                  ],
                  volumeMounts: [
                    {
                      name: "data",
                      mountPath: "/app/data",
                    },
                    {
                      name: "tz-paris",
                      mountPath: "/etc/localtime",
                    },
                  ],
                },
              ],
              securityContext: {
                runAsNonRoot: true,
                runAsUser: 1000,
                fsGroup: 1000,
                supplementalGroups: [1000],
              },
              volumes: [
                {
                  name: "data",
                  persistentVolumeClaim: {
                    claimName: name,
                  },
                },
                {
                  name: "tz-paris",
                  hostPath: {
                    path: "/usr/share/zoneinfo/Europe/Paris",
                  },
                },
              ],
              restartPolicy: "Never",
            },
          },
        },
      },
    },
  });
  return [configMap, cronJob, secret, persistentVolumeClaim];
};
