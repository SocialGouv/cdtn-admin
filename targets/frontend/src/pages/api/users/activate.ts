// import Boom from "@hapi/boom";
// import { z } from "zod";
// import { gqlClient } from "@shared/utils";
// import { hash } from "argon2";
// import { createErrorFor } from "src/lib/apiError";

// import { sendPasswordChangeConfirmEmail } from "../../lib/emails/passwordChangeConfirm";
// import { getUserEmailQuery } from "./get_user_email.gql";
// import { activateUserMutation } from "./password.gql";
// import { passwordSchema } from "./validation";

// export function createRequestHandler({
//   mutation,
//   error_message = "error",
//   success_message = "success",
//   sendConfirmation = false,
// }) {
//   return async function (req, res) {
//     const apiError = createErrorFor(res);

//     if (req.method === "GET") {
//       res.setHeader("Allow", ["POST"]);
//       return apiError(Boom.methodNotAllowed("GET method not allowed"));
//     }

//     const schema = z.object({
//       password: passwordSchema,
//       token: z.string().uuid(),
//     });

//     const { error, data: value } = schema.safeParse(req.body);
//     if (error) {
//       return apiError(Boom.badRequest(error.message));
//     }

//     const [queryResult, result] = await Promise.all([
//       await gqlClient()
//         .query(getUserEmailQuery, {
//           secret_token: value.token,
//         })
//         .toPromise(),
//       await gqlClient()
//         .mutation(mutation, {
//           now: new Date().toISOString(),
//           password: await hash(value.password),
//           secret_token: value.token,
//         })
//         .toPromise(),
//     ]);

//     if (result.error) {
//       console.error(result.error);
//       return apiError(Boom.unauthorized("request failed"));
//     }

//     if (result.data["update_user"].affected_rows === 0) {
//       return apiError(Boom.unauthorized(error_message));
//     }

//     console.log("[set password]", value.token);
//     if (sendConfirmation) {
//       const [{ email }] = queryResult.data.users;
//       try {
//         await sendPasswordChangeConfirmEmail(email);
//         console.log("[actions] send password change confirmation email");
//         res.json({ message: "email sent!", statusCode: 200 });
//       } catch (error) {
//         console.log(error);
//         console.error(
//           `[actions] send lost password change confirmation to ${email} failed`
//         );
//         apiError(
//           Boom.badGateway(
//             `[actions] send change confirmation email to ${email} failed`
//           )
//         );
//       }
//     }

//     res.json({ message: success_message });
//   };
// }

// export default createRequestHandler({
//   errorMessage:
//     "Account is already activated, the secret token has expired or there is no account.",
//   mutation: activateUserMutation,
//   success_message: "user activated !",
// });

// import Boom from "@hapi/boom";
// import { createErrorFor } from "src/lib/apiError";
// import { sendActivateAccountEmail } from "src/lib/emails/activateAccount";
// import { NextApiRequest, NextApiResponse } from "next";
// import { getUserSecretToken } from "../../../lib/emails/getAccountSecretToken";

// type Response = { message: string; statusCode: number };

// export default async function ActivateAccount(
//   req: NextApiRequest,
//   res: NextApiResponse<Response>
// ) {
//   const apiError = createErrorFor(res);
//   if (req.method === "GET") {
//     console.error("[ActivateAccount] GET method not allowed");
//     res.setHeader("Allow", ["POST"]);
//     return apiError(Boom.methodNotAllowed("GET method not allowed"));
//   }

//   if (
//     !req.headers["actions-secret"] ||
//     req.headers["actions-secret"] !== process.env.ACTIONS_SECRET
//   ) {
//     console.error("[ActivateAccount] Missing secret or env");
//     return apiError(Boom.unauthorized("Missing secret or env"));
//   }

//   const { email } = req.body.input;
//   try {
//     const secret_token = await getUserSecretToken(email);
//     await sendActivateAccountEmail(email, secret_token);
//     console.log("[actions] send activate account email");
//     res.json({ message: "email sent!", statusCode: 200 });
//   } catch (error) {
//     console.error(`[actions] send activation email to ${email} failed`, error);
//     apiError(
//       Boom.badGateway(`[actions] send activation email to ${email} failed`)
//     );
//   }
// }
