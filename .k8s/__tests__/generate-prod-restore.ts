//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("kosko generate --prod jobs/restore", async () => {
  expect(
    await getEnvManifests("prod", "jobs/restore", {
      ...project("cdtn-admin").prod,
      BACKUP_DB_FILE: "some-backup.sql.gz",
      BACKUP_DB_NAME: "some-database",
      BACKUP_DB_OWNER: "some-owner",
      CI_JOB_ID: "424242",
      DESTINATION_CONTAINER: "destination-container",
      DESTINATION_SERVER: "dev",
      SOURCE_CONTAINER: "source-container",
      SOURCE_SERVER: "prod",
    })
  ).toMatchSnapshot();
});
