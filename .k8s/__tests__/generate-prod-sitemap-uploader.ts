//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("kosko generate --prod sitemap-uploader", async () => {
  expect(
    await getEnvManifests("prod", "sitemap-uploader", {
      ...project("cdtn-admin").prod,
      SITEMAP_ENDPOINT: "https://path/to/sitemap",
      DESTINATION_CONTAINER: "destination-container",
      DESTINATION_NAME: "sitemap.xml",
      SECRET_NAME: "azure-volume-dev-secret",
    })
  ).toMatchSnapshot();
});
