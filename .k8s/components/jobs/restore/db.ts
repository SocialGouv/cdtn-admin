//

import {
  autodevopsPgUserParams,
  restoreDbFromAzureBackup,
} from "@socialgouv/kosko-charts/components/azure-pg";
import { readFileSync } from "fs";
import environments from "@socialgouv/kosko-charts/environments";
import env from "@kosko/env";
import { join } from "path";
export default async () => {
  const ciEnv = environments(process.env);

  if (env.env !== "prod") {
    // HACK(douglasduteil): only run on production cluster
    return;
  }

  const currentBranchParams = autodevopsPgUserParams(ciEnv.branchSlug);

  return restoreDbFromAzureBackup(
    `hasura-prod-to-${currentBranchParams.database}`,
    {
      azureStorageAccountBackupSecretFile:
        "restore/pg-backup.sealed-secret.yaml",
      env,
      file: "hasura_prod_db.psql.gz",
      pgAdminDevSecretFile: "restore/azure-pg-admin-user-dev.yaml",
      project: "cdtnadmin",
      postRestoreScript: readFileSync(join(__dirname, "./post-restore.sql"))
        .toString()
        .replace("${PGDATABASE}", currentBranchParams.database),
    }
  );
};
