import { ok } from "assert";

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

const params = values[process.env.TRIGGER as TriggerType];
ok(params, `unknown process.env.TRIGGER value ${process.env.TRIGGER}`);

export default params;
