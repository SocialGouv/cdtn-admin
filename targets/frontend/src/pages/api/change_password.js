import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import { client } from "@shared/graphql-client";
import { hash, verify } from "argon2";
import { createErrorFor } from "src/lib/apiError";

import { changeMyPasswordMutation, getOldPassword } from "./password.gql";

export default async function changePassword(req, res) {
  const apiError = createErrorFor(res);

  if (req.method === "GET") {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }

  const schema = Joi.object({
    id: Joi.string().guid({ version: "uuidv4" }).required(),
    oldPassword: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return apiError(Boom.badRequest(error.details[0].message));
  }

  let result = await client
    .query(getOldPassword, {
      id: value.id,
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    return apiError(Boom.serverUnavailable("get old password failed"));
  }

  const { user } = result.data;
  if (!user) {
    return apiError(Boom.unauthorized("Invalid id or password"));
  }
  // see if password hashes matches
  const match = await verify(user.password, value.oldPassword);

  if (!match) {
    console.error("old password does not match");
    return apiError(Boom.unauthorized("Invalid id or password"));
  }

  result = await client
    .query(changeMyPasswordMutation, {
      id: value.id,
      password: await hash(value.password),
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    return apiError(Boom.serverUnavailable("set new password failed"));
  }

  console.log("[change password]", value.id);

  res.json({ message: "password updated" });
}
