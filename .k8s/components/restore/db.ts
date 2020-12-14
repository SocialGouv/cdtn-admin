import env from "@kosko/env";
import { ok } from "assert";

import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";

ok(process.env.SOURCE_CONTAINER, process.env.DESTINATION_CONTAINER);

const manifests = restoreDbJob({
  project: "cdtn-admin",
  env: [
    new EnvVar({
      name: "PGDATABASE",
      value: `db_${process.env.CI_COMMIT_SHORT_SHA}`,
    }),
    new EnvVar({
      name: "OWNER",
      value: `user_${process.env.CI_COMMIT_SHORT_SHA}`,
    }),
    new EnvVar({
      name: "FILE",
      value: "product_prod_db.psql.gz",
    }),
  ],
});

export default manifests;
