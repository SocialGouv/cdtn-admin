import env from "@kosko/env";
import type { SealedSecret } from "@kubernetes-models/sealed-secrets/bitnami.com/v1alpha1/SealedSecret";
import { create } from "@socialgouv/kosko-charts/components/azure-pg";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import { updateMetadata } from "@socialgouv/kosko-charts/utils/updateMetadata";
import { ok } from "assert";

export default (): { kind: string }[] => {
  // HACK(douglasduteil): provide one db per env
  // The CI_ENVIRONMENT_SLUG is the most useful for this
  ok(process.env.CI_ENVIRONMENT_SLUG, "Missing CI_ENVIRONMENT_SLUG");

  process.env.CI_COMMIT_SHORT_SHA = process.env.CI_ENVIRONMENT_SLUG.replace(
    /-/g,
    ""
  );
  //

  if (env.env === "dev") {
    return create({
      env,
    });
  }

  // in prod/preprod, we try to add a fixed sealed-secret
  const secret = loadYaml<SealedSecret>(env, `pg-user.sealed-secret.yaml`);
  if (!secret) {
    return [];
  }

  const envParams = gitlab(process.env);
  // add gitlab annotations
  updateMetadata(secret, {
    annotations: envParams.annotations ?? {},
    labels: envParams.labels ?? {},
    namespace: envParams.namespace,
  });
  return [secret];
};
