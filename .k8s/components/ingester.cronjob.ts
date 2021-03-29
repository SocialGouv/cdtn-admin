import env from "@kosko/env";
import { ok } from "assert";
import { CronJob } from "kubernetes-models/batch/v1beta1/CronJob";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { merge } from "@socialgouv/kosko-charts/utils/@kosko/env/merge";
import { PersistentVolumeClaim } from "kubernetes-models/v1/PersistentVolumeClaim";

const gitlabEnv = gitlab(process.env);
const HOST = process.env.CI_ENVIRONMENT_URL;
ok(HOST);
const name = "ingester";

const persistentVolumeClaim = new PersistentVolumeClaim({
  metadata: {
    name: "ingester-data",
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
                image: "${CI_REGISTRY_IMAGE}/ingester:${IMAGE_TAG}",
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
                  {
                    name: "PRODUCTION",
                    value: "${PRODUCTION}",
                  },
                  {
                    name: "HASURA_GRAPHQL_ENDPOINT",
                    value: "http://hasura/v1/graphql",
                  },
                ],
                envFrom: [
                  {
                    secretRef: {
                      name: "cdtn-admin-secrets",
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
                  claimName: "ingester-data",
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
export default [cronJob];
