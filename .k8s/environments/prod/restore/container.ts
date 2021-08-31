import environments from "@socialgouv/kosko-charts/environments";

const ciEnv = environments(process.env);
type TriggerType = "UPDATE_PROD" | "UPDATE_PREPROD";

const values: Record<TriggerType, unknown> = {
  UPDATE_PREPROD: {
    server: "dev",
    container: "cdtn-preprod",
  },
  UPDATE_PROD: {
    server: "prod",
    container: "cdtn",
  },
};

const params = values[process.env.TRIGGER as TriggerType] || {
  // ??? What it the difference with TRIGGER "UPDATE_PREPROD" ?
  container: `cdtn-${ciEnv.tag ? "preprod" : "dev"}`,
  server: "dev",
};

export default params;
