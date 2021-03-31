import Boom from "@hapi/boom";
import { createErrorFor } from "src/lib/apiError";
import { triggerDeploy } from "src/lib/gitlab.api";

export default async function (req, res) {
  const apiError = createErrorFor(res);

  if (req.method === "GET") {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }
  const { env } = req.body.input;

  try {
    await triggerDeploy(env);
    res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(`[actions] trigger pipeline failed, error`, error);
    apiError(res, Boom.serverUnavailable(`[actions] can't trigger pipeline`));
  }
}
