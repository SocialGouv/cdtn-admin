import Boom from "@hapi/boom";
import { apiError } from "src/lib/apiError";
import { getPipelines, getPipelineVariables } from "src/lib/gitlab.api";

export default async function ActivateAccount(req, res) {
  if (req.method === "GET") {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }

  if (
    !req.headers["actions-secret"] ||
    req.headers["actions-secret"] !== process.env.ACTIONS_SECRET
  ) {
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
      (state, variables) => {
        const varsObj = variables.reduce(
          (obj, { key, value }) => ({ ...obj, [key]: value }),
          {}
        );
        if (varsObj.UPDATE_DATA) {
          return { ...state, [varsObj.UPDATE_DATA]: true };
        }
        return state;
      },
      { preprod: false, prod: false }
    );
    res.json(runningDeployementPipeline);
  } catch (error) {
    console.error(`[actions] get pipelines failed`, error);
    res
      .status(error.status)
      .json({ code: error.status, message: "[actions]: can't get pipelines" });
  }
}
