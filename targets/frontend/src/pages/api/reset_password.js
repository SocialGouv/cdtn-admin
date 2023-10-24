import Boom from "@hapi/boom";
import { z } from "zod";
import { client } from "@shared/graphql-client";
import { createErrorFor } from "src/lib/apiError";
import { getExpiryDate } from "src/lib/duration";
import { v4 as uuidv4 } from "uuid";
import { ACTIVATION_TOKEN_EXPIRES } from "../../config";

export default async function reset_password(req, res) {
  const apiError = createErrorFor(res);

  if (req.method === "GET") {
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }

  const schema = z.object({
    email: z.string().email(),
  });

  const { error, data: value } = schema.safeParse(req.body);

  if (error) {
    return apiError(Boom.badRequest(error.details[0].message));
  }

  const { email } = value;
  const secret_token = uuidv4();
  const result = await client
    .mutation(udpateSecretTokenMutation, {
      email,
      expires: getExpiryDate(ACTIVATION_TOKEN_EXPIRES),
      secret_token,
    })
    .toPromise();

  if (result.error) {
    // silently fail to not disclose if user exists or not
    console.error(result.error);
    res.json({ message: "reset password" });
    return;
  }

  await client
    .mutation(emailPasswordRequestMutation, { email, secret_token })
    .toPromise();

  console.log("[reset_password]", email);
  res.json({ message: "reset password" });
}

const udpateSecretTokenMutation = `
mutation updateSecretTokenMutation(
  $email: citext!,
  $expires: timestamptz!,
  $secret_token: uuid
) {
  update_user: update_auth_users(
    where: {
      email: { _eq: $email} ,
  	}
    _set: {
    	secret_token_expires_at: $expires
      secret_token: $secret_token
  	}
  ){
    affected_rows
  }
}
`;

const emailPasswordRequestMutation = `
mutation email($email: citext!, $secret_token: uuid!) {
	email_password_request(email: $email, secret_token:$secret_token)
}
`;
