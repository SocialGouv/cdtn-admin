import { restoreContainerJob } from "@socialgouv/kosko-charts/components/azure-storage";
import { EnvVar, ISecret } from "kubernetes-models/v1";
import { ok } from "assert";
import env from "@kosko/env";
import environments from "@socialgouv/kosko-charts/environments";
import { loadFile } from "@kosko/yaml";

export default async () => {
  const params = env.component("restore/container");
  const ciEnv = environments(process.env);

  const secret = await loadFile(
    `environments/${env.env}/restore/azure-volumes.sealed-secret.yaml`
  );
  ok(secret, "Missing restore/azure-volumes.sealed-secret.yaml");

  const job = restoreContainerJob(
    `cdtn-files-to-${params.server}-${params.container}-${ciEnv.branch}`,
    {
      from: { container: "cdtn", volume: "dev" },
      to: { container: params.container, volume: params.server },
    }
  );

  return [job, secret];
};
