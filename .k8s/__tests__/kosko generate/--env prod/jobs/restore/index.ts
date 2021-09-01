//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("fail on real production env", async () => {
  await expect(
    getEnvManifests("prod", "jobs/restore", {
      ...project("cdtn-admin").prod,
    })
  ).rejects.toThrowError(
    "Command failed: npx --no-install kosko generate --env prod jobs/restore" +
      "\n" +
      "Error: Should only run from dev environments"
  );
});

const gitlabCiEnvNameProd = {
  CI_ENVIRONMENT_NAME: "prod",
  CI_ENVIRONMENT_SLUG: "prod",
  KUBE_NAMESPACE: "cdtn-admin",
};
test("should generate dev restore for prod cluster", async () => {
  expect(
    await getEnvManifests("prod", "jobs/restore", {
      ...project("cdtn-admin").dev,
      // HACK(douglasduteil): only run on production cluster
      ...gitlabCiEnvNameProd,
    })
  ).toMatchSnapshot();
});

test("should generate preprod restore for prod cluster", async () => {
  expect(
    await getEnvManifests("prod", "jobs/restore", {
      ...project("cdtn-admin").preprod,
      // HACK(douglasduteil): only run on production cluster
      ...gitlabCiEnvNameProd,
    })
  ).toMatchSnapshot();
});
