import containerJob from "./container";
import dbJob from "./db";
import env from "@kosko/env";
export default env.env === "prod" ? [containerJob, dbJob] : [];
