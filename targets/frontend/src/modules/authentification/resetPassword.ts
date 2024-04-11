import { gqlClient } from "@shared/utils";
import { hash, verify } from "argon2";
import { gql } from "urql";
import { AuthEmailResetPasswordError, AuthGqlError } from "./utils/errors";
import { sendLostPasswordEmail } from "../emails/sendLostPasswordEmail";
import { generateActivationToken } from "./utils/jwt";

const getUserQuery = gql`
  query login($email: citext!) {
    auth_users(where: { email: { _eq: $email } }) {
      id
    }
  }
`;

interface GetUserHasuraResult {
  auth_users: { id: string }[];
}

export const resetPassword = async (email: string): Promise<void> => {
  const getUserResult = await gqlClient()
    .query<GetUserHasuraResult>(getUserQuery, {
      email,
    })
    .toPromise();

  if (getUserResult.error || !getUserResult.data?.auth_users[0]?.id) {
    throw new AuthGqlError({
      cause: getUserResult.error,
      message: "Error to get user",
      name: "AUTH_GQL_ERROR",
    });
  }

  const activationTokenGenerated = generateActivationToken(
    getUserResult.data.auth_users[0].id
  );

  try {
    await sendLostPasswordEmail(email, activationTokenGenerated);
  } catch (error) {
    throw new AuthEmailResetPasswordError({
      cause: error,
      message: "Impossible to send reset password email",
      name: "SEND_EMAIL_RESET_PASSWORD_ERROR",
    });
  }
};
