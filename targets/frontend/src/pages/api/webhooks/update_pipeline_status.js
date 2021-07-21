import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import { client } from "@shared/graphql-client";
import { logger } from "@socialgouv/cdtn-logger";
import { updatePipelineStatusMutation } from "src/components/pipelines/Status";
import { createErrorFor } from "src/lib/apiError";
import { getPipelineInfos } from "src/lib/gitlab.api";
/**
 * This Webhooks is called by a scheduled event to update a pipeline status
 * @param {*} req
 * @param {*} res
 * @returns
 */
export default async function updatePipelineStatus(req, res) {
  const apiError = createErrorFor(res);

  if (
    !req.headers["actions-secret"] ||
    req.headers["actions-secret"] !== process.env.ACTIONS_SECRET
  ) {
    logger.error("[update pipeline status] Invalid secret token");
    return apiError(Boom.unauthorized("Missing secret or env"));
  }
  // fetch pipeline info and update dataUpdate entrie
  const schema = Joi.object()
    .keys({
      payload: Joi.object()
        .keys({
          pipeline_id: Joi.string().required(),
        })
        .unknown()
        .required(),
    })
    .unknown()
    .required();

  const { error, value } = schema.validate(req.body);

  if (error) {
    logger.error(`[update pipeline status] joi ${error.details[0].message}`);
    return apiError(Boom.badRequest(error.details[0].message));
  }

  const { pipeline_id } = value.payload;
  const { id, status } = await getPipelineInfos(pipeline_id);
  const { error: gqlError } = await client
    .mutation(updatePipelineStatusMutation, { pipelineId: pipeline_id, status })
    .toPromise();

  if (gqlError) {
    logger.error(`[update pipeline status] gql ${gqlError.message}`, gqlError);
    return apiError(Boom.badRequest(gqlError.message));
  }

  res.status(200).json({ id, status });
}
