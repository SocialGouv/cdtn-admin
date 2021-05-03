//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("SITEMAP_UPLOADER_TARGET=preprod kosko generate --prod jobs/sitemap-uploader", async () => {
  process.env.HARBOR_PROJECT = "cdtn";
  expect(
    await getEnvManifests("prod", "jobs/sitemap-uploader", {
      ...project("cdtn-admin").prod,
      SITEMAP_UPLOADER_TARGET: "preprod",
    })
  ).toMatchSnapshot();
});

test("SITEMAP_UPLOADER_TARGET=prod kosko generate --prod jobs/sitemap-uploader", async () => {
  process.env.HARBOR_PROJECT = "cdtn";
  expect(
    await getEnvManifests("prod", "jobs/sitemap-uploader", {
      ...project("cdtn-admin").prod,
      SITEMAP_UPLOADER_TARGET: "prod",
    })
  ).toMatchSnapshot();
});
