//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);

test("kosko generate --prod jobs/restore/container when TRIGGER is set to PREPROD", async () => {
  process.env.HARBOR_PROJECT = "cdtn";
  process.env.CI_JOB_ID = "123456789";
  process.env.TRIGGER = "UPDATE_PREPROD";
  expect(
    await getEnvManifests("prod", "jobs/restore/container", {
      ...project("cdtn-admin").prod,
    })
  ).toMatchSnapshot();
});
test("kosko generate --prod jobs/restore/container when TRIGGER is set to PROD", async () => {
  process.env.HARBOR_PROJECT = "cdtn";
  process.env.CI_JOB_ID = "123456789";
  process.env.TRIGGER = "UPDATE_PROD";
  expect(
    await getEnvManifests("prod", "jobs/restore/container", {
      ...project("cdtn-admin").prod,
    })
  ).toMatchSnapshot();
});
