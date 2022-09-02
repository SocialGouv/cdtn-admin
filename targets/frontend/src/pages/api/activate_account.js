import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import { client } from "@shared/graphql-client";
import { hash } from "argon2";
import { createErrorFor } from "src/lib/apiError";

import { sendPasswordChangeConfirmEmail } from "../../lib/emails/passwordChangeConfirm";
import { passwordValidation } from "../../lib/regex";
import { getUserEmailQuery } from "./get_user_email.gql";
import { activateUserMutation } from "./password.gql";

export function createRequestHandler({
  mutation,
  error_message = "error",
  success_message = "success",
  sendConfirmation = false,
}) {
  return async function (req, res) {
    const apiError = createErrorFor(res);

    if (req.method === "GET") {
      res.setHeader("Allow", ["POST"]);
      return apiError(Boom.methodNotAllowed("GET method not allowed"));
    }

    const schema = Joi.object({
      password: Joi.string()
        .min(12)
        .max(32)
        .regex(passwordValidation)
        .required(),
      token: Joi.string().guid({ version: "uuidv4" }).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return apiError(Boom.badRequest(error.details[0].message));
    }

    const [queryResult, result] = await Promise.all([
      await client
        .query(getUserEmailQuery, {
          secret_token: value.token,
        })
        .toPromise(),
      await client
        .mutation(mutation, {
          now: new Date().toISOString(),
          password: await hash(value.password),
          secret_token: value.token,
        })
        .toPromise(),
    ]);

    if (result.error) {
      console.error(result.error);
      return apiError(Boom.unauthorized("request failed"));
    }

    if (result.data["update_user"].affected_rows === 0) {
      return apiError(Boom.unauthorized(error_message));
    }

    console.log("[set password]", value.token);
    if (sendConfirmation) {
      const [{ email }] = queryResult.data.users;
      try {
        await sendPasswordChangeConfirmEmail(email);
        console.log("[actions] send password change confirmation email");
        res.json({ message: "email sent!", statusCode: 200 });
      } catch (error) {
        console.log(error);
        console.error(
          `[actions] send lost password change confirmation to ${email} failed`
        );
        apiError(
          Boom.badGateway(
            `[actions] send change confirmation email to ${email} failed`
          )
        );
      }
    }

    res.json({ message: success_message });
  };
}

export default createRequestHandler({
  errorMessage:
    "Account is already activated, the secret token has expired or there is no account.",
  mutation: activateUserMutation,
  success_message: "user activated !",
});
