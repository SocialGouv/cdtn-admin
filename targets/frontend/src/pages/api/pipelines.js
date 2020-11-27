import { getPipelines, getPipelineVariables } from "src/lib/gitlab.api";

export default async function pipelines(req, res) {
  const pipelines = await getPipelines({ ref: "master" });

  const activePipelines = pipelines.filter(
    ({ status }) => status === "pending" || status === "running"
  );

  const pipelinesDetails = await Promise.all(
    activePipelines.map(({ id }) => getPipelineVariables(id))
  );
  const runningDeployementPipeline = pipelinesDetails.flat().reduce(
    (state, { key, value }) => {
      if (key === "UPDATE_ES_INDEX") {
        state[value.toLowerCase()] = true;
      }
      return state;
    },
    { preprod: false, prod: false }
  );
  res.json(runningDeployementPipeline);
  res.end();
}
