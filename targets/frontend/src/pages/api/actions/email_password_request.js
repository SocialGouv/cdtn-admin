import Boom from "@hapi/boom";
import { createErrorFor } from "src/lib/apiError";
import { sendLostPasswordEmail } from "src/lib/emails/lostPassword";

export default async function AskNewPassword(req, res) {
  const apiError = createErrorFor(res);
  if (req.method === "GET") {
    console.error("[AskNewPassword] GET method not allowed");
    res.setHeader("Allow", ["POST"]);
    return apiError(Boom.methodNotAllowed("GET method not allowed"));
  }

  if (
    !req.headers["actions-secret"] ||
    req.headers["actions-secret"] !== process.env.ACTIONS_SECRET
  ) {
    console.error("[AskNewPassword] Missing secret or env");
    return apiError(Boom.unauthorized("Missing secret or env"));
  }

  const { email, secret_token } = req.body.input;
  try {
    await sendLostPasswordEmail(email, secret_token);
    console.log("[actions] send lost password email");
    res.json({ message: "email sent!", statusCode: 200 });
  } catch (error) {
    console.error(`[actions] send lost password email to ${email} failed`);
    apiError(
      Boom.badGateway(`[actions] send lost password email to ${email} failed`)
    );
  }
}
