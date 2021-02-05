import { ok } from "assert";
import env from "@kosko/env";
import type { SealedSecret } from "@kubernetes-models/sealed-secrets/bitnami.com/v1alpha1/SealedSecret";
import { Job } from "kubernetes-models/batch/v1/Job";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import { merge } from "@socialgouv/kosko-charts/utils/@kosko/env/merge";
import { ConfigMap } from "kubernetes-models/_definitions/IoK8sApiCoreV1ConfigMap";
import { waitForHttp } from "@socialgouv/kosko-charts/utils"

ok(process.env.CI_REGISTRY_IMAGE, "Missing CI_REGISTRY_IMAGE"); // cdtn-dev
ok(process.env.ES_INDEX_PREFIX, "Missing ES_INDEX_PREFIX"); // cdtn-dev
ok(process.env.CDTN_ADMIN_ENDPOINT, "Missing CDTN_ADMIN_ENDPOINT"); // //___/api/graphql

const configMap = loadYaml<ConfigMap>(env, `injestor.configmap.yaml`);
const secret = loadYaml<SealedSecret>(env, "injestor.sealed-secret.yaml");

const injestor = () => {
  const envParams = merge(gitlab(process.env), {});

  const job = new Job({
    metadata: {
      name: `injestor-es-${process.env.CI_JOB_ID}`,
      namespace: envParams.namespace.name,
    },
    spec: {
      backoffLimit: 0,
      template: {
        spec: {
          initContainers: [
            waitForHttp({
              "name": "wait-for-hasura",
              "url": "http://hasura-cdtn-admin/healthz"
            })
          ],
          containers: [
            {
              name: "ingester-es",
              image:
                `registry.gitlab.factory.social.gouv.fr/socialgouv/cdtn-admin/ingester-es:${process.env.CI_COMMIT_SHA}`,
              imagePullPolicy: "IfNotPresent",
              resources: {
                limits: {
                  cpu: "1",
                  memory: "1Gi",
                },
                requests: {
                  cpu: "500m",
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
                  }
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
  return job;
};

export default [configMap, secret, injestor()];
