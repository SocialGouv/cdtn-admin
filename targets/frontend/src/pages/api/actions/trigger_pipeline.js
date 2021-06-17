import Boom from "@hapi/boom";
import { createErrorFor } from "src/lib/apiError";
import { triggerDeploy } from "src/lib/gitlab.api";

const gitlabTriggerNames = {
  preprod: "UPDATE_PREPROD",
  prod: "UPDATE_PROD",
};

export default async function triggerPipeline(req, res) {
  const apiError = createErrorFor(res);

  if (req.method === "GET") {
    console.error("[triggerPipeline] GET method not allowed");
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }
  const { env } = req.body.input; // env preprod || prod
  const gitlabTriggerName = gitlabTriggerNames[env];

  if (!gitlabTriggerName) {
    console.error("[triggerPipeline] Invalid secret token");
    return apiError(Boom.badRequest("env not allowed"));
  }

  try {
    await triggerDeploy(gitlabTriggerName);
    console.log(`[actions] trigger deploy pipeline ${env}`);
    res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(`[actions] trigger deploy pipeline ${env}`, error);
    apiError(Boom.badGateway(`[actions] can't trigger pipeline ${env}`));
  }
}
