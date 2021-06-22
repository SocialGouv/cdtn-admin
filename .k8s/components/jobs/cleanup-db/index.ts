import env from "@kosko/env";
import { ok } from "assert";
import { readFileSync } from "fs";
import { CronJob } from "kubernetes-models/batch/v1beta1";
import { join } from "path";

const manifests = [];
const sql_cleanup = readFileSync(join(__dirname, "cleanup.sql")).toString();

const cronJob = new CronJob({
  metadata: {
    name: "cleanup-db",
    namespace: "cdtn-admin",
  },
  spec: {
    schedule: "0 4 * * 6",
    jobTemplate: {
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: "db-cleaner",
                image: `postgres:10`,
                command: ["psql", "-c", sql_cleanup],
                envFrom: [
                  {
                    secretRef: {
                      name: "azure-pg-user",
                    },
                  },
                ],
              },
            ],
            restartPolicy: "Never",
          },
        },
      },
    },
  },
});
manifests.push(cronJob);

export default env.env === "prod" ? manifests : [];
