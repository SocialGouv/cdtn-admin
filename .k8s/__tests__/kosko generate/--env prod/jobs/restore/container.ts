//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);

test("should restore from dev to preprod", async () => {
  expect(
    await getEnvManifests("prod", "jobs/restore/container", {
      ...project("cdtn-admin").prod,
      TRIGGER: "UPDATE_PREPROD",
    })
  ).toMatchSnapshot();
});

test("should restore from dev to prod", async () => {
  expect(
    await getEnvManifests("prod", "jobs/restore/container", {
      ...project("cdtn-admin").prod,
      TRIGGER: "UPDATE_PROD",
    })
  ).toMatchSnapshot();
});
