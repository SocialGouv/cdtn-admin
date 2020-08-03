const { getEnvManifests } = require("./lib/helpers");

const envVars = {
  CI_COMMIT_REF_NAME: "master",
  CI_ENVIRONMENT_NAME: "prod2",
  CI_ENVIRONMENT_SLUG: "cdtn-admin-master",
  CI_ENVIRONMENT_URL:
    "https://preprod-sample-next-app.dev2.fabrique.social.gouv.fr",
  CI_PROJECT_NAME: "cdtn-admin",
  CI_PROJECT_PATH_SLUG: "socialgouv-cdtn-admin",
  CI_REGISTRY_IMAGE:
    "registry.gitlab.factory.social.gouv.fr/socialgouv/cdtn-admin",
  CI_REPOSITORY_URL: "git@github.com:SocialGouv/cdtn-admin.git",
  KUBE_INGRESS_BASE_DOMAIN: "fabrique.social.gouv.fr",
  KUBE_NAMESPACE: "cdtn-admin-master",
  RANCHER_PROJECT_ID: "c-kk8xm:p-4fxg8",
  CI_COMMIT_SHA: "8843083edb7f873cad1d1420731a60773594ffae",
  CI_COMMIT_SHORT_SHA: "8843083",
  PRODUCTION: "true",
};

test(`k8s for PROD environment`, async () => {
  const yaml = await getEnvManifests({ envName: "prod", envVars });
  expect(yaml).toMatchSnapshot();
});
