import { Job } from "kubernetes-models/batch/v1/Job";

// renovate: datasource=docker depName=mcr.microsoft.com/azure-cli versioning=2.9.1
const AZ_DOCKER_TAG = "2.9.1";

const uploadSitemapScript = `

echo "Fetch sitemap from $SITEMAP_ENDPOINT"
wget $SITEMAP_ENDPOINT -O sitemap.xml

echo "Upload sitemap to azure/$DESTINATION_CONTAINER/$DESTINATION_NAME"
az storage blob upload --account-name $AZ_ACCOUNT_NAME --account-key $AZ_ACCOUNT_KEY --container-name $DESTINATION_CONTAINER --file sitemap.xml --name $DESTINATION_NAME

`;

const job = new Job({
  metadata: {
    name: "sitemap-uploader",
    namespace: "cdtn-admin-secret",
  },

  spec: {
    backoffLimit: 3,
    template: {
      metadata: {
        name: "sitemap-uploader",
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
                value: "sitemap",
              },
              {
                name: "DESTINATION_NAME",
                value: "test.xml",
              },
              {
                name: "AZ_ACCOUNT_NAME",
                value: "$(azurestorageaccountname)",
              },
              {
                name: "AZ_ACCOUNT_KEY",
                value: "$(azurestorageaccountkey)",
              },
              {
                name: "SITEMAP_ENDPOINT",
                value: "https://code.travail.gouv.fr",
              },
            ],
            envFrom: [
              {
                secretRef: {
                  name: "azure-cdtnadmindev-volume",
                },
              },
            ],
          },
        ],
      },
    },
  },
});

export default job;
