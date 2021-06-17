//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("INGESTER_ELASTICSEARCH_TARGET=preprod kosko generate --env prod jobs/ingester-elasticsearch", async () => {
  process.env.HARBOR_PROJECT = "cdtn";
  expect(
    await getEnvManifests("prod", "jobs/ingester-elasticsearch", {
      ...project("cdtn-admin").prod,
      INGESTER_ELASTICSEARCH_TARGET: "preprod",
      RANCHER_PROJECT_ID: "c-bar:p-foo",
    })
  ).toMatchSnapshot();
});

test("INGESTER_ELASTICSEARCH_TARGET=prod kosko generate --env prod jobs/ingester-elasticsearch", async () => {
  process.env.HARBOR_PROJECT = "cdtn";
  expect(
    await getEnvManifests("prod", "jobs/ingester-elasticsearch", {
      ...project("cdtn-admin").prod,
      INGESTER_ELASTICSEARCH_TARGET: "prod",
      RANCHER_PROJECT_ID: "c-bar:p-foo",
    })
  ).toMatchSnapshot();
});
