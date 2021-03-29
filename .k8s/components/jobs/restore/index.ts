import containerJob from "./container";
import dbJob from "./db";
import env from "@kosko/env";
export default process.env.PRODUCTION ? [] : [containerJob, dbJob];
