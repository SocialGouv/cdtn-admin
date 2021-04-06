import { CronJob } from "kubernetes-models/batch/v1beta1/CronJob";
import { ConfigMap } from "kubernetes-models/v1/ConfigMap";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { merge } from "@socialgouv/kosko-charts/utils/@kosko/env/merge";
import { ok } from "assert";
import env from "@kosko/env";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import type { SealedSecret } from "@kubernetes-models/sealed-secrets/bitnami.com/v1alpha1/SealedSecret";

const gitlabEnv = gitlab(process.env);
const name = "alert";

const configMap = loadYaml<ConfigMap>(env, `alert.configmap.yaml`);
ok(configMap, "Missing alert.configmap.yaml");
const secret = loadYaml<SealedSecret>(env, "alert.sealed-secret.yaml");
ok(secret, "Missing alert.sealed-secret.yaml");

const tag = process.env.CI_COMMIT_TAG
  ? process.env.CI_COMMIT_TAG.slice(1)
  : process.env.CI_COMMIT_SHA;

const cronJob = new CronJob({
  metadata: {
    annotations: merge(gitlabEnv.annotations || {}, {
      "kapp.k14s.io/disable-default-ownership-label-rules": "",
      "kapp.k14s.io/disable-default-label-scoping-rules": "",
    }),
    labels: merge(
      {
        app: name,
      },
      gitlabEnv.labels ?? {}
    ),
    name,
  },
  spec: {
    concurrencyPolicy: "Forbid",
    successfulJobsHistoryLimit: 3,
    failedJobsHistoryLimit: 3,
    schedule: "0 1 * * *",
    jobTemplate: {
      spec: {
        backoffLimit: 0,
        template: {
          metadata: {
            annotations: {
              "kapp.k14s.io/deploy-logs": "for-new-or-existing",
            },
          },
          spec: {
            containers: [
              {
                name: "update-alert",
                image: `${process.env.CI_REGISTRY_IMAGE}/${name}:${tag}`,
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
                      name: secret.metadata?.name,
                    },
                  },
                ],
                volumeMounts: [
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

export default [configMap, secret, cronJob];
