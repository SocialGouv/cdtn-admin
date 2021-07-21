import Boom from "@hapi/boom";
import { logger } from "@socialgouv/cdtn-logger";
import { createErrorFor } from "src/lib/apiError";
import { getPipelineInfos } from "src/lib/gitlab.api";

export default async function getPipelineStatus(req, res) {
  const apiError = createErrorFor(res);

  if (req.method === "GET") {
    logger.error("[pipeline status] GET method not allowed");
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }

  if (
    !req.headers["actions-secret"] ||
    req.headers["actions-secret"] !== process.env.ACTIONS_SECRET
  ) {
    logger.error("[pipeline status] Invalid secret token");
    return apiError(Boom.unauthorized("Missing secret or env"));
  }
  const { pipelineId } = req.body.input;

  try {
    const { id, status } = await getPipelineInfos(pipelineId);
    res.json({ id: id.toString(), status });
  } catch (error) {
    logger.error(`[actions] get pipelines status failed`, error);
    apiError(Boom.badGateway(`[actions] get pipelines status failed`));
  }
}
