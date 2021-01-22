import Boom from "@hapi/boom";
import { apiError } from "src/lib/apiError";
import { sendLostPasswordEmail } from "src/lib/emails/lostPassword";

export default async function AskNewPassword(req, res) {
  if (
    !req.headers["actions-secret"] ||
    req.headers["actions-secret"] !== process.env.ACTIONS_SECRET
  ) {
    return apiError(res, Boom.unauthorized("Missing secret or env"));
  }

  const { email, secret_token } = req.body.input;
  try {
    await sendLostPasswordEmail(email, secret_token);
    res.json({ message: "email sent!", statusCode: 200 });
  } catch (error) {
    console.error(`[email] send activation email to ${email} failed`);
    apiError(res, Boom.badGateway(`send activation email to ${email} failed`));
  }
}
