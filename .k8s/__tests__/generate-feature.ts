//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("kosko generate --dev", async () => {
  expect(
    await getEnvManifests("dev", "", {
      ...project("cdtn-admin").dev,
      //
      // Feature like env
      CI_COMMIT_REF_NAME: "jean-mich/Jeune-homme-à-la-roses-1.2.3",
      CI_COMMIT_REF_SLUG: "jean-mich-jeune-homme-à-la-roses-1-2-3",
      CI_ENVIRONMENT_NAME: "jean-mich/Jeune-homme-à-la-roses-1.2.3",
      CI_ENVIRONMENT_SLUG: "jean-mich-jeune-123456",
      CI_ENVIRONMENT_URL: `https://jean-mich-jeune-123456-cdtn-admin.dev2.fabrique.social.gouv.fr`,
      KUBE_NAMESPACE: `cdtn-admin-85-jean-mich-jeune-123456`,
      PRODUCTION: "",
      //
      RANCHER_PROJECT_ID: "c-bar:p-foo",
    })
  ).toMatchSnapshot();
});
