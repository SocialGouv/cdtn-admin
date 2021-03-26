import subHours from "date-fns/subHours";

import { request } from "./request";

const url = process.env.GITLAB_URL;
const projectId = process.env.GITLAB_PROJECT_ID;
const accessToken = process.env.GITLAB_ACCESS_TOKEN;
const token = process.env.GITLAB_TRIGGER_TOKEN;

export function getPipelines({ ref = "master", since }) {
  if (!since) {
    since = subHours(new Date(), 2);
  }
  return request(
    `${url}/projects/${projectId}/pipelines?updated_after=${since.toISOString()}&ref=${ref}&order_by=updated_at`,
    {
      headers: { Authorization: `Bearer ${accessToken.trim()}` },
    }
  );
}

export function getPipelineInfos(id) {
  return request(`${url}/projects/${projectId}/pipelines/${id}`, {
    headers: { Authorization: `Bearer ${accessToken.trim()}` },
  });
}

export function getPipelineVariables(id) {
  return request(`${url}/projects/${projectId}/pipelines/${id}/variables`, {
    headers: { Authorization: `Bearer ${accessToken.trim()}` },
  });
}

export function triggerDeploy(env) {
  return request(`${url}/projects/${projectId}/trigger/pipeline`, {
    body: {
      ref: "master",
      token,
      variables: {
        ACTION: `ingest_documents_${env === "prod" ? "prod" : "dev"}`,
        ES_INDEX_PREFIX: env === "prod" ? "cdtn-prod" : "cdtn-preprod",
      },
    },
  });
}
