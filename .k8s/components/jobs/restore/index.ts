import containerJob from "./container";
import dbJob from "./db";
export default process.env.PRODUCTION ? [] : [containerJob, dbJob];
