import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import { createErrorFor } from "src/lib/apiError";
import { triggerDeploy } from "src/lib/gitlab.api";

export default async function (req, res) {
  const apiError = createErrorFor(res);

  if (req.method === "GET") {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }

  const schema = Joi.object({
    env: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    console.error(error);
    return apiError(Boom.badRequest(error.details[0].message));
  }
  if (["PROD", "PREPROD"].includes(value.env)) {
    return apiError(Boom.badRequest(`unknow env ${value.env}`));
  }

  await triggerDeploy(value.env);
  res.status(200).json({ message: "ok" });

  res.end();
}
