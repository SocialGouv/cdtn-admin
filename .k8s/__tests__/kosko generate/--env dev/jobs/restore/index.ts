//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("fail without --env prod", async () => {
  await expect(
    getEnvManifests("dev", "jobs/restore", {
      ...project("cdtn-admin").dev,
    })
  ).rejects.toThrowError(
    "Command failed: npx --no-install kosko generate --env dev jobs/restore" +
      "\n" +
      "Error: Should only run on --env prod clusters"
  );
});
