import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import { client } from "@shared/graphql-client";
import { hash } from "argon2";
import { createErrorFor } from "src/lib/apiError";

import { activateUserMutation } from "./password.gql";

export function createRequestHandler({
  mutation,
  error_message = "error",
  success_message = "success",
}) {
  return async function (req, res) {
    const apiError = createErrorFor(res);

    if (req.method === "GET") {
      res.setHeader("Allow", ["POST"]);
      return apiError(Boom.methodNotAllowed("GET method not allowed"));
    }

    const schema = Joi.object({
      password: Joi.string().required(),
      token: Joi.string().guid({ version: "uuidv4" }).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return apiError(Boom.badRequest(error.details[0].message));
    }

    const result = await client
      .query(mutation, {
        now: new Date().toISOString(),
        password: await hash(value.password),
        secret_token: value.token,
      })
      .toPromise();

    if (result.error) {
      console.error(result.error);
      return apiError(Boom.unauthorized("request failed"));
    }

    if (result.data["update_user"].affected_rows === 0) {
      return apiError(Boom.unauthorized(error_message));
    }

    console.log("[set password]", value.token);

    res.json({ message: success_message });
  };
}

export default createRequestHandler({
  errorMessage:
    "Account is already activated, the secret token has expired or there is no account.",
  mutation: activateUserMutation,
  success_message: "user activated !",
});
