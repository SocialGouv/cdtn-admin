//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("kosko generate --prod jobs/cleanup-db", async () => {
  expect(
    await getEnvManifests("prod", "jobs/cleanup-db", {
      ...project("cdtn-admin").prod,
    })
  ).toMatchSnapshot();
});
