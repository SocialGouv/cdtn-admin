import { createRequestHandler } from "./activate_account";
import { changePasswordMutation } from "./password.gql";

export default createRequestHandler({
  error_message: "The secret token has expired or there is no account.",
  mutation: changePasswordMutation,
  success_message: "password changed !",
});
