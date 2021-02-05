//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("kosko generate jobs/injestor --dev ", async () => {
  expect(
    await getEnvManifests("dev", "jobs/injestor", {
      ...project("cdtn-admin").dev,
      CDTN_ADMIN_ENDPOINT: "https://cdtn-admin.fabrique.social.gouv.fr/api/graphql",
      ES_INDEX_PREFIX: `cdtn-dev`,
      KUBE_NAMESPACE: "foo-XYZ-master-dev2",
      RANCHER_PROJECT_ID: "c-bar:p-foo",
    })
  ).toMatchSnapshot();
});
