import koskoEnv from "@kosko/env";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { Job } from "kubernetes-models/batch/v1/Job";
import { merge } from "@socialgouv/kosko-charts/utils/@kosko/env/merge";

// renovate: datasource=docker depName=mcr.microsoft.com/azure-cli versioning=2.9.1
const AZ_DOCKER_TAG = "2.9.1";

const uploadSitemapScript = `
echo "Fetch sitemap from $SITEMAP_ENDPOINT"

curl --fail -L $SITEMAP_ENDPOINT -o sitemap.xml

if [[ -f sitemap.xml ]]; then
  # replace the default urls hostname if $BASE_URL is given
  [[ -n $BASE_URL ]] && sed -i -E 's#<loc>https?://[^/]*/#<loc>'$BASE_URL'/#' sitemap.xml
  # upload
  echo "Upload sitemap to azure/$DESTINATION_CONTAINER/$DESTINATION_NAME"
  az storage blob upload --account-name $AZ_ACCOUNT_NAME --account-key $AZ_ACCOUNT_KEY --container-name $DESTINATION_CONTAINER --file sitemap.xml --name $DESTINATION_NAME
else
  echo "Cannot fetch sitemap.xml, abort"
  exit 1
fi

`;

const gitlabEnv = gitlab(process.env);
const env = koskoEnv.component("sitemap-uploader");

const createSitemapJob = () => {
  const job = new Job({
    metadata: {
      annotations: merge(gitlabEnv.annotations || {}, {
        "kapp.k14s.io/disable-default-ownership-label-rules": "",
        "kapp.k14s.io/disable-default-label-scoping-rules": "",
        "kapp.k14s.io/update-strategy": "fallback-on-replace",
      }),
      name: `sitemap-uploader`,
      namespace: "cdtn-admin-secret",
    },

    spec: {
      backoffLimit: 3,
      template: {
        metadata: {
          name: `sitemap-uploader`,
          annotations: {
            "kapp.k14s.io/deploy-logs": "for-new-or-existing",
          },
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
                {
                  name: "BASE_URL",
                  value: process.env.BASE_URL || env.BASE_URL,
                },
                {
                  name: "DESTINATION_CONTAINER",
                  value: "sitemap",
                },
                {
                  name: "DESTINATION_NAME",
                  value: process.env.DESTINATION_NAME || env.DESTINATION_NAME,
                },
                {
                  name: "SITEMAP_ENDPOINT",
                  value: `${process.env.CI_ENVIRONMENT_URL}/api/sitemap`,
                },
                {
                  name: "AZ_ACCOUNT_NAME",
                  value: "$(azurestorageaccountname)",
                },
                {
                  name: "AZ_ACCOUNT_KEY",
                  value: "$(azurestorageaccountkey)",
                },
              ],
              envFrom: [
                {
                  secretRef: {
                    name: process.env.SECRET_NAME || env.SECRET_NAME,
                  },
                },
              ],
            },
          ],
        },
      },
    },
  });
  return job;
};

const job = createSitemapJob();
export default job;
