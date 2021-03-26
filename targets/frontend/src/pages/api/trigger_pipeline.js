import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import { verify } from "jsonwebtoken";
import { createErrorFor } from "src/lib/apiError";
import { triggerDeploy } from "src/lib/gitlab.api";

const { HASURA_GRAPHQL_JWT_SECRET } = process.env;
const jwtSecret = JSON.parse(HASURA_GRAPHQL_JWT_SECRET);

export default async function (req, res) {
  const apiError = createErrorFor(res);

  if (req.method === "GET") {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }

  const { token } = req.headers;
  if (!verify(token, jwtSecret.key, { algorithms: jwtSecret.type })) {
    return apiError(Boom.badRequest("wrong token"));
  }

  const schema = Joi.object({
    env: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    console.error(error);
    return apiError(Boom.badRequest(error.details[0].message));
  }

  await triggerDeploy(value.env);
  res.status(200).json({ message: "ok" });

  res.end();
}
