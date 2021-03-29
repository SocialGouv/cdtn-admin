import { CronJob } from "kubernetes-models/batch/v1beta1/CronJob";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { merge } from "@socialgouv/kosko-charts/utils/@kosko/env/merge";
import { PersistentVolumeClaim } from "kubernetes-models/v1/PersistentVolumeClaim";
import { ok } from "assert";
import env from "@kosko/env";

const gitlabEnv = gitlab(process.env);
const name = "ingester";

// HACK(douglasduteil): provide one db per env
// The CI_ENVIRONMENT_SLUG is the most useful for this
ok(process.env.CI_ENVIRONMENT_SLUG, "Missing CI_ENVIRONMENT_SLUG");

const pgSecretRefName =
  env.env === "dev"
    ? `azure-pg-user-${process.env.CI_ENVIRONMENT_SLUG.replace(/-/g, "")}`
    : "azure-pg-user";

const tag = process.env.CI_COMMIT_TAG
  ? process.env.CI_COMMIT_TAG.slice(1)
  : process.env.CI_COMMIT_SHA;

const persistentVolumeClaim = new PersistentVolumeClaim({
  metadata: {
    name,
  },
  spec: {
    accessModes: ["ReadWriteOnce"],
    resources: {
      requests: {
        storage: "2Gi",
      },
    },
  },
});

const cronJob = new CronJob({
  metadata: {
    annotations: gitlabEnv.annotations,
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
                  {
                    name: "HASURA_GRAPHQL_ENDPOINT",
                    value: "http://hasura/v1/graphql",
                  },
                ],
                envFrom: [
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

export default [cronJob, persistentVolumeClaim];
