// import Boom from "@hapi/boom";
// import { z } from "zod";
// import { gqlClient } from "@shared/utils";
// import { hash, verify } from "argon2";
// import { createErrorFor } from "src/lib/apiError";

// import { sendPasswordChangeConfirmEmail } from "../../lib/emails/passwordChangeConfirm";
// import { changeMyPasswordMutation, getOldPassword } from "./password.gql";
// import { passwordSchema } from "./validation";

// export default async function changePassword(req, res) {
//   const apiError = createErrorFor(res);

//   if (req.method === "GET") {
//     res.setHeader("Allow", ["POST"]);
//     return apiError(Boom.methodNotAllowed("GET method not allowed"));
//   }

//   const schema = z.object({
//     id: z.string().uuid(),
//     oldPassword: z.string(),
//     password: passwordSchema,
//   });

//   const { error, data: value } = schema.safeParse(req.body);
//   if (error) {
//     return apiError(Boom.badRequest(error.message));
//   }

//   let result = await gqlClient()
//     .query(getOldPassword, {
//       id: value.id,
//     })
//     .toPromise();

//   if (result.error) {
//     console.error(result.error);
//     return apiError(Boom.serverUnavailable("get old password failed"));
//   }

//   const { user } = result.data;
//   if (!user) {
//     return apiError(Boom.unauthorized("Invalid id or password"));
//   }
//   // see if password hashes matches
//   const match = await verify(user.password, value.oldPassword);

//   if (!match) {
//     console.error("old password does not match");
//     return apiError(Boom.unauthorized("Invalid id or password"));
//   }

//   result = await gqlClient()
//     .mutation(changeMyPasswordMutation, {
//       id: value.id,
//       password: await hash(value.password),
//     })
//     .toPromise();

//   if (result.error) {
//     console.error(result.error);
//     return apiError(Boom.serverUnavailable("set new password failed"));
//   }

//   console.log("[change password]", value.id);
//   const { email } = user;
//   try {
//     await sendPasswordChangeConfirmEmail(email);
//     console.log("[actions] send password change confirmation email");
//     res.json({ message: "email sent!", statusCode: 200 });
//   } catch (error) {
//     console.error(error);
//     console.error(
//       `[actions] send lost password change confirmation to ${email} failed`
//     );
//     apiError(
//       Boom.badGateway(
//         `[actions] send change confirmation email to ${email} failed`
//       )
//     );
//   }

//   res.json({ message: "password updated" });
// }

// import Boom from "@hapi/boom";
// import { createErrorFor } from "src/lib/apiError";
// import { sendLostPasswordEmail } from "src/lib/emails/lostPassword";

// export default async function AskNewPassword(req, res) {
//   const apiError = createErrorFor(res);
//   if (req.method === "GET") {
//     console.error("[AskNewPassword] GET method not allowed");
//     res.setHeader("Allow", ["POST"]);
//     return apiError(Boom.methodNotAllowed("GET method not allowed"));
//   }

//   if (
//     !req.headers["actions-secret"] ||
//     req.headers["actions-secret"] !== process.env.ACTIONS_SECRET
//   ) {
//     console.error("[AskNewPassword] Missing secret or env");
//     return apiError(Boom.unauthorized("Missing secret or env"));
//   }

//   const { email, secret_token } = req.body.input;
//   try {
//     await sendLostPasswordEmail(email, secret_token);
//     console.log("[actions] send lost password email");
//     res.json({ message: "email sent!", statusCode: 200 });
//   } catch (error) {
//     console.error(`[actions] send lost password email to ${email} failed`);
//     apiError(
//       Boom.badGateway(`[actions] send lost password email to ${email} failed`)
//     );
//   }
// }
