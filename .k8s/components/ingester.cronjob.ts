import { CronJob } from "kubernetes-models/batch/v1beta1/CronJob";
import { ConfigMap } from "kubernetes-models/v1/ConfigMap";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { merge } from "@socialgouv/kosko-charts/utils/@kosko/env/merge";
import { PersistentVolumeClaim } from "kubernetes-models/v1/PersistentVolumeClaim";
import { ok } from "assert";
import env from "@kosko/env";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import { PG_ENVIRONMENT_SLUG } from "../utils/PG_ENVIRONMENT_SLUG";

const gitlabEnv = gitlab(process.env);
const name = "ingester";

// HACK(douglasduteil): provide one db per env
// The CI_ENVIRONMENT_SLUG is the most useful for this
ok(process.env.CI_ENVIRONMENT_SLUG, "Missing CI_ENVIRONMENT_SLUG");

const pgSecretRefName =
  env.env === "dev" ? `azure-pg-user-${PG_ENVIRONMENT_SLUG}` : "azure-pg-user";

const tag = process.env.CI_COMMIT_TAG
  ? process.env.CI_COMMIT_TAG.slice(1)
  : process.env.CI_COMMIT_SHA;

const configMap = loadYaml<ConfigMap>(env, `ingester.configmap.yaml`);
ok(configMap, "Missing ingester.configmap.yaml");

const persistentVolumeClaim = new PersistentVolumeClaim({
  metadata: {
    name,
    //  Set this annotation to NOT let Kubernetes automatically create
    //  a persistent volume for this volume claim.
    annotations: {
      "volume.beta.kubernetes.io/storage-class": "",
    },
  },
  spec: {
    accessModes: ["ReadWriteOnce"],
    resources: {
      requests: {
        storage: "2Gi",
      },
    },
    selector: {
      // To make sure we match the claim with the exact volume, match the label
      matchLabels: {
        usage: name,
      },
    },
  },
});

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
    schedule: "30 0 * * *",
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
                name: "update-ingester",
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
                      name: pgSecretRefName,
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

export default [configMap, cronJob, persistentVolumeClaim];
