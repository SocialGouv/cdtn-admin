import Boom from "@hapi/boom";
import { z } from "zod";
import { client } from "@shared/graphql-client";
import { createErrorFor } from "src/lib/apiError";
import { removeJwtCookie } from "src/lib/auth/cookie";

export default async function logout(req, res) {
  const apiError = createErrorFor(res);

  const schema = z.object({
    refresh_token: z.string().uuid(),
  });

  let { error, data: value } = schema.safeParse(req.cookies);

  if (error) {
    res = schema.safeParse(req.body);
    error = res.error;
    value = res.data;
  }

  if (error) {
    return apiError(Boom.badRequest(error.details[0].message));
  }

  const { refresh_token } = value;

  // delete refresh token passed in data
  const result = await client
    .mutation(mutation, {
      refresh_token: refresh_token,
    })
    .toPromise();

  if (result.error) {
    console.error("logout error", result.error);
  }

  console.log("[ logout ]", { refresh_token });

  removeJwtCookie(res);

  console.log("[logout]", refresh_token);
  res.json({ message: "user logout !" });
}

const mutation = `mutation  deleteRefreshToken(
  $refresh_token: uuid!,
) {
  delete_refresh_token: delete_auth_refresh_tokens (
    where: {
      refresh_token: { _eq: $refresh_token }
    }) {
    affected_rows
  }
}
`;
