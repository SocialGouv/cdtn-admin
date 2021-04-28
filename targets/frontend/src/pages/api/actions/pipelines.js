import Boom from "@hapi/boom";
import { apiError } from "src/lib/apiError";
import { getPipelines, getPipelineVariables } from "src/lib/gitlab.api";

export default async function pipelines(req, res) {
  if (req.method === "GET") {
    console.error("[pipelines] GET method not allowed");
    res.setHeader("Allow", ["POST"]);
    return apiError(res, Boom.methodNotAllowed("GET method not allowed"));
  }

  if (
    !req.headers["actions-secret"] ||
    req.headers["actions-secret"] !== process.env.ACTIONS_SECRET
  ) {
    console.error("[pipelines] Invalid secret token");
    return apiError(res, Boom.unauthorized("Missing secret or env"));
  }

  try {
    const pipelines = await getPipelines();
    const activePipelines = pipelines.filter(
      ({ status }) => status === "pending" || status === "running"
    );
    const pipelinesDetails = await Promise.all(
      activePipelines.map(({ id }) => getPipelineVariables(id))
    );
    const runningDeployementPipeline = pipelinesDetails.reduce(
      (state, pipelineVariables) => {
        const varsObj = pipelineVariables.reduce(
          (obj, { key, value }) => ({ ...obj, [key]: value }),
          {}
        );
        if (varsObj?.TRIGGER === "UPDATE_PREPROD") {
          return { ...state, preprod: true };
        }
        if (varsObj?.TRIGGER === "UPDATE_PROD") {
          return { ...state, prod: true };
        }
        return state;
      },
      { preprod: false, prod: false }
    );
    res.json(runningDeployementPipeline);
  } catch (error) {
    console.error(`[actions] get pipelines failed`, error);
    apiError(res, Boom.badGateway(`[actions] get pipelines failed`));
  }
}
