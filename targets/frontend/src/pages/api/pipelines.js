import Boom from "@hapi/boom";
import { verify } from "jsonwebtoken";
import { createErrorFor } from "src/lib/apiError";
import { getPipelines, getPipelineVariables } from "src/lib/gitlab.api";

const { HASURA_GRAPHQL_JWT_SECRET } = process.env;
const jwtSecret = JSON.parse(HASURA_GRAPHQL_JWT_SECRET);

export default async function pipelines(req, res) {
  const apiError = createErrorFor(res);
  const { token } = req.headers;

  if (!token || !verify(token, jwtSecret.key, { algorithms: jwtSecret.type })) {
    return apiError(Boom.badRequest("wrong token"));
  }

  const pipelines = await getPipelines({ ref: "master" });

  const activePipelines = pipelines.filter(
    ({ status }) => status === "pending" || status === "running"
  );

  const pipelinesDetails = await Promise.all(
    activePipelines.map(({ id }) => getPipelineVariables(id))
  );
  const runningDeployementPipeline = pipelinesDetails.reduce(
    (state, variables) => {
      const varsObj = variables.reduce(
        state,
        ({ key, value }) => ({ ...state, [key]: value }),
        {}
      );
      if (
        varsObj.ACTION === "ingest_documents_dev" &&
        varsObj.ES_INDEX_PREFIX === "cdtn-preprod"
      ) {
        state.preprod = true;
      }
      if (varsObj.ACTION === "ingest_documents_prod") {
        state.prod = true;
      }
      return state;
    },
    { preprod: false, prod: false }
  );
  res.json(runningDeployementPipeline);
  res.end();
}
