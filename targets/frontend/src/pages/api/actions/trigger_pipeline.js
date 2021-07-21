import Boom from "@hapi/boom";
import { client } from "@shared/graphql-client";
import { logger } from "@socialgouv/cdtn-logger";
import { addMinutes } from "date-fns";
import { createErrorFor } from "src/lib/apiError";
import { triggerDeploy } from "src/lib/gitlab.api";

const gitlabTriggerNames = {
  preprod: "UPDATE_PREPROD",
  prod: "UPDATE_PROD",
};

const insertPipelineMutation = `
mutation insertPipeline($pipelineId: String!, $userId: uuid, $environment: String!) {
  pipeline: insert_pipelines_one(object: {pipeline_id: $pipelineId, user_id: $userId, environment: $environment}) {
    id
    environment
    pipeline_id
    status
    user_id
    created_at
  }
}
`;

export default async function triggerPipeline(req, res) {
  const apiError = createErrorFor(res);
  if (req.method === "GET") {
    logger.error("[triggerPipeline] GET method not allowed");
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }

  const { environment } = req.body.input;
  const { "x-hasura-user-id": userId } = req.body.session_variables;

  const gitlabTriggerName = gitlabTriggerNames[environment];

  if (!gitlabTriggerName) {
    logger.error("[triggerPipeline] Invalid secret token");
    return apiError(Boom.badRequest("environment not allowed"));
  }

  try {
    const { id: pipelineId } = await triggerDeploy(gitlabTriggerName);

    logger.info(`[actions] trigger deploy pipeline ${environment}`);

    const { data, error } = await client
      .mutation(insertPipelineMutation, {
        environment,
        pipelineId: pipelineId.toString(),
        userId,
      })
      .toPromise();

    // if Hasura operation errors, then throw error
    if (error) {
      logger.error(
        `[actions] hasura fail derived action ${environment}`,
        error
      );
      return res.status(400).json("`[actions] fail to insert pipeline info");
    }

    const {
      // eslint-disable-next-line no-unused-vars
      pipeline: { __typename, ...payload },
    } = data;

    // We create a scheduled event to fetch the result of the pipeline and save it
    await createScheduledEvent(pipelineId.toString());
    return res.json({ ...payload });
  } catch (error) {
    logger.error(`[actions] trigger deploy pipeline ${environment}`, error);
    apiError(
      Boom.badGateway(`[actions] can't trigger pipeline ${environment}`)
    );
  }
}

async function createScheduledEvent(pipelineId) {
  await fetch(
    `${process.env.HASURA_GRAPHQL_ENDPOINT.replace(
      "/v1/graphql",
      "/v1/query"
    )}`,
    {
      body: JSON.stringify({
        args: {
          headers: [
            {
              name: "actions-secret",
              value_from_env: "ACTIONS_SECRET",
            },
          ],
          payload: {
            pipeline_id: pipelineId,
          },
          schedule_at: addMinutes(new Date(), 60),
          webhook: "{{API_URL}}/webhooks/update_pipeline_status",
        },
        type: "create_scheduled_event",
      }),
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
      },
      method: "POST",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      logger.log("schedule event", data);
    });
}
