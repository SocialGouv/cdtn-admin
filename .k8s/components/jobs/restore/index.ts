import environments from "@socialgouv/kosko-charts/environments";
import env from "@kosko/env";
import containerJob from "./container";
import dbJob from "./db";

export default () => {
  const ciEnv = environments(process.env);

  if (env.env !== "prod") {
    // HACK(douglasduteil): only run with --env prod
    throw new Error("Should only run on --env prod clusters");
  }

  if (ciEnv.isProduction) {
    // HACK(douglasduteil): only run on production cluster
    throw new Error("Should only run from dev environments");
  }
  return [containerJob, dbJob];
};
