import Boom from "@hapi/boom";
import { createErrorFor } from "src/lib/apiError";
import { triggerDeploy } from "src/lib/gitlab.api";

const gitlabTriggerNames = {
  preprod: "UPDATE_PREPROD",
  prod: "UPDATE_PROD",
};

export default async function (req, res) {
  const apiError = createErrorFor(res);

  if (req.method === "GET") {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }
  const { env } = req.body.input; // env preprod || prod
  const gitlabTriggerName = gitlabTriggerNames[env];

  if (!gitlabTriggerName) {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.badRequest("env not allowed"));
  }

  try {
    await triggerDeploy(gitlabTriggerName);
    res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(`[actions] trigger pipeline failed, error`, error);
    apiError(res, Boom.serverUnavailable(`[actions] can't trigger pipeline`));
  }
}
