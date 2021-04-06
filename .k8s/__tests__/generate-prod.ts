//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("kosko generate --prod", async () => {
  expect(
    await getEnvManifests("prod", "", {
      ...project("cdtn-admin").prod,
      IP_ALLOWLIST: "123.456.456.789,42.0.0.0/8",
    })
  ).toMatchSnapshot();
});
