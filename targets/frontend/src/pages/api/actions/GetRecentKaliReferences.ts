import Boom from "@hapi/boom";
import { createErrorFor } from "src/lib/apiError";
import { fetchRecentKaliReferences } from "../../../lib/references";

export default async function GetRecentKaliReferences(req: any, res: any) {
  const apiError = createErrorFor(res);
  if (req.method === "GET") {
    console.error("[GetRecentKaliReferences] GET method not allowed");
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }
  const refs = await fetchRecentKaliReferences(req.body.input);
  res.json({ refs });
}
