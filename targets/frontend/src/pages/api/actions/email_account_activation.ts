import Boom from "@hapi/boom";
import { createErrorFor } from "src/lib/apiError";
import { sendActivateAccountEmail } from "src/lib/emails/activateAccount";
import { NextApiRequest, NextApiResponse } from "next";
import { getUserSecretToken } from "../../../lib/emails/getAccountSecretToken";

type Response = { message: string; statusCode: number };

export default async function ActivateAccount(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const apiError = createErrorFor(res);
  if (req.method === "GET") {
    console.error("[ActivateAccount] GET method not allowed");
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }

  if (
    !req.headers["actions-secret"] ||
    req.headers["actions-secret"] !== process.env.ACTIONS_SECRET
  ) {
    console.error("[ActivateAccount] Missing secret or env");
    return apiError(Boom.unauthorized("Missing secret or env"));
  }

  const { email } = req.body.input;
  try {
    const secret_token = await getUserSecretToken(email);
    await sendActivateAccountEmail(email, secret_token);
    console.log("[actions] send activate account email");
    res.json({ message: "email sent!", statusCode: 200 });
  } catch (error) {
    console.error(`[actions] send activation email to ${email} failed`, error);
    apiError(
      Boom.badGateway(`[actions] send activation email to ${email} failed`)
    );
  }
}
