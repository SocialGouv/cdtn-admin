import { gqlClient } from "@shared/utils";
import { gql } from "urql";
import { AuthEmailSendError, AuthGqlError } from "./errors";
import { UserSignedIn } from "./signIn";
import { sendActivateAccountEmail } from "../emails/sendActivateAccountEmail";
import { generateActivationToken } from "./jwt";

const insertQuery = gql`
  mutation insertUser($name: String!, $email: citext!, $role: String!) {
    insert_auth_users_one(object: { name: $name, email: $email, role: $role }) {
      id
    }
  }
`;

interface InsertUserHasuraResult {
  insert_auth_users_one: {
    id: string;
  };
}

export const createUser = async (
  name: string,
  email: string
): Promise<boolean> => {
  const defaultRole = "super" as UserSignedIn["role"];
  const result = await gqlClient()
    .mutation<InsertUserHasuraResult>(insertQuery, {
      name,
      email,
      role: defaultRole,
    })
    .toPromise();

  if (result.error || !result.data?.insert_auth_users_one.id) {
    throw new AuthGqlError({
      cause: result.error,
      message: "Impossible to register user",
      name: "AUTH_GQL_ERROR",
    });
  }

  const activationTokenGenerated = generateActivationToken(
    result.data.insert_auth_users_one.id
  );

  try {
    await sendActivateAccountEmail(email, activationTokenGenerated);
  } catch (error) {
    throw new AuthEmailSendError({
      cause: error,
      message: "Impossible to send activation email",
      name: "SEND_EMAIL_ERROR",
    });
  }

  return true;
};
