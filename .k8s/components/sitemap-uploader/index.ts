import { ok } from "assert";
import { Job } from "kubernetes-models/batch/v1/Job";

// renovate: datasource=docker depName=mcr.microsoft.com/azure-cli versioning=2.9.1
const AZ_DOCKER_TAG = "2.9.1";

const uploadSitemapScript = `

echo "Fetch sitemap from $SITEMAP_ENDPOINT"
wget $SITEMAP_ENDPOINT -O sitemap.xml

# replace the default urls hostname if \$BASE_URL is given
[[ -z $BASE_URL ]] && sed -i -e 's/<loc>https:\/\/[^/]\+\//<loc>'$BASE_URL'\//' sitemap.xml

echo "Upload sitemap to azure/$DESTINATION_CONTAINER/$DESTINATION_NAME"
az storage blob upload --account-name $AZ_ACCOUNT_NAME --account-key $AZ_ACCOUNT_KEY --container-name $DESTINATION_CONTAINER --file sitemap.xml --name $DESTINATION_NAME

`;

ok(process.env.SITEMAP_ENDPOINT); // https://url/sitemap
ok(process.env.DESTINATION_CONTAINER); // sitemap
ok(process.env.DESTINATION_NAME); // sitemap.xml
ok(process.env.SECRET_NAME); // azure-cdtnadmindev-volume | azure-cdtnadminprod-volume

const createSitemapJob = () => {
  const job = new Job({
    metadata: {
      name: `sitemap-uploader-${process.env.CI_JOB_ID}`,
      namespace: "cdtn-admin-secret",
    },

    spec: {
      backoffLimit: 3,
      template: {
        metadata: {
          name: `sitemap-uploader-${process.env.CI_JOB_ID}`,
          namespace: "cdtn-admin-secret",
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
                  name: "DESTINATION_CONTAINER",
                  value: process.env.DESTINATION_CONTAINER,
                },
                {
                  name: "DESTINATION_NAME",
                  value: process.env.DESTINATION_NAME,
                },
                {
                  name: "SITEMAP_ENDPOINT",
                  value: process.env.SITEMAP_ENDPOINT,
                },
                {
                  name: "BASE_URL",
                  value: process.env.BASE_URL,
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
                    name: process.env.SECRET_NAME,
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
