import koskoEnv from "@kosko/env";
import type { SealedSecret } from "@kubernetes-models/sealed-secrets/bitnami.com/v1alpha1/SealedSecret";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { merge } from "@socialgouv/kosko-charts/utils/@kosko/env/merge";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import { updateMetadata } from "@socialgouv/kosko-charts/utils/updateMetadata";
import { ok } from "assert";
import { Job } from "kubernetes-models/batch/v1/Job";
import type { ConfigMap } from "kubernetes-models/_definitions/IoK8sApiCoreV1ConfigMap";

//

const target = process.env.SITEMAP_UPLOADER_TARGET;
ok(target, "Missing SITEMAP_UPLOADER_TARGET");

//

// renovate: datasource=docker depName=mcr.microsoft.com/azure-cli versioning=2.9.1
const AZ_DOCKER_TAG = "2.9.1";

const uploadSitemapScript = `
echo "Fetch sitemap from $SITEMAP_ENDPOINT?baseurl=$BASE_URL"

curl --fail -L $SITEMAP_ENDPOINT?baseurl=$BASE_URL -o sitemap.xml

if [[ -f sitemap.xml ]]; then
  # upload
  echo "Upload sitemap to azure/$DESTINATION_CONTAINER/$DESTINATION_NAME"
  az storage blob upload --account-name $AZ_ACCOUNT_NAME --account-key $AZ_ACCOUNT_KEY --container-name $DESTINATION_CONTAINER --file sitemap.xml --name $DESTINATION_NAME
else
  echo "Cannot fetch sitemap.xml, abort"
  exit 1
fi

`;

const gitlabEnv = gitlab(process.env);
const name = `sitemap-uploader-${target}`;
const annotations = merge(gitlabEnv.annotations || {}, {
  "kapp.k14s.io/disable-default-ownership-label-rules": "",
  "kapp.k14s.io/disable-default-label-scoping-rules": "",
});
const labels = merge(gitlabEnv.labels || {}, {
  app: name,
});
const env = koskoEnv.component("sitemap-uploader");

//

export default async () => {
  const secret = await loadYaml<SealedSecret>(
    koskoEnv,
    `sitemap-uploader/${target}.sealed-secret.yaml`
  );
  ok(secret, `Missing sitemap-uploader/${target}.sealed-secret.yaml`);
  updateMetadata(secret, {
    namespace: gitlabEnv.namespace,
    annotations,
    labels,
  });

  const configMap = await loadYaml<ConfigMap>(
    koskoEnv,
    `sitemap-uploader/${target}.configmap.yaml`
  );
  ok(configMap, `Missing sitemap-uploader/${target}.configmap.yaml`);
  updateMetadata(configMap, {
    namespace: gitlabEnv.namespace,
    annotations,
    labels,
  });

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
      backoffLimit: 3,
      template: {
        metadata: {
          name,
          annotations: merge(annotations, {
            "kapp.k14s.io/deploy-logs": "for-new-or-existing",
          }),
          labels,
        },

        spec: {
          restartPolicy: "OnFailure",
          containers: [
            {
              name: "az-sitemap-uploader",
              image: `mcr.microsoft.com/azure-cli:${AZ_DOCKER_TAG}`,
              command: ["bash"],
              args: ["-c", uploadSitemapScript],
              env: [
                ...(env.BASE_URL
                  ? [
                      {
                        name: "BASE_URL",
                        value: env.BASE_URL,
                      },
                    ]
                  : []),
              ],
              envFrom: [
                {
                  configMapRef: {
                    name: configMap?.metadata?.name,
                  },
                },
                {
                  secretRef: {
                    name: secret.metadata?.name,
                  },
                },
              ],
            },
          ],
        },
      },
    },
  });
  return [job, secret, configMap];
};
