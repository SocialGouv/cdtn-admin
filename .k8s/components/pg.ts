import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/azure-pg";
import { getDevDatabaseParameters } from "@socialgouv/kosko-charts/components/azure-pg/params";
import { generate } from "@socialgouv/kosko-charts/utils/environmentSlug";
import environment from "@socialgouv/kosko-charts/environments";

export default create("pg-user", {
  env,
  config: {
    ...getDevDatabaseParameters({
      suffix: generate(environment(process.env).branch),
    }),
  } as any,
});
