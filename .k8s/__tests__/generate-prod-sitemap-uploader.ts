//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("kosko generate --prod jobs/sitemap-uploader", async () => {
  expect(
    await getEnvManifests("prod", "jobs/sitemap-uploader", {
      ...project("cdtn-admin").prod,
      BASE_URL: "https://host.tmp",
      CI_JOB_ID: "424242",
      DESTINATION_CONTAINER: "destination-container",
      DESTINATION_NAME: "sitemap.xml",
      SECRET_NAME: "azure-volume-dev-secret",
      SITEMAP_ENDPOINT: "https://path/to/sitemap",
    })
  ).toMatchSnapshot();
});
