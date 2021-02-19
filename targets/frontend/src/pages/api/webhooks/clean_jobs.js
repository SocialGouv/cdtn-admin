import Boom from "@hapi/boom";
import { client } from "@shared/graphql-client";
import { apiError } from "src/lib/apiError";

const updateJobMutation = `mutation($now: timestamptz) {
  update_clean_jobs(
    where: {}
    _set: { updated_at: $now }
  ) {
    affected_rows
  }
}
`;

export default async function CleanJob(req, res) {
  if (
    !req.headers["jobs-secret"] ||
    req.headers["jobs-secret"] !== process.env.JOBS_SECRET
  ) {
    return apiError(res, Boom.unauthorized("Missing secret or env"));
  }

  try {
    const { error } = await client
      .mutation(updateJobMutation, { now: new Date() })
      .toPromise();
    if (error) {
      throw error;
    }
    console.error(`[clean_jobs] launched`);
    res.json({ message: "clean_job updated!", statusCode: 200 });
  } catch (error) {
    console.error(`[clean_jobs] failed`);
    apiError(res, Boom.serverUnavailable(`trigger clean_job failed`));
  }
}
