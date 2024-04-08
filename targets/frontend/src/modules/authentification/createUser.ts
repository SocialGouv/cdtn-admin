import { gqlClient } from "@shared/utils";
import { gql } from "urql";
import { AuthEmailSendError, AuthGqlError } from "./utils/errors";
import { UserSignedIn } from "./signIn";
import { sendActivateAccountEmail } from "../emails/sendActivateAccountEmail";
import { generateActivationToken } from "./utils/jwt";

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

const deleteQuery = gql`
  mutation deleteUser($id: uuid!) {
    delete_auth_users_by_pk(id: $id) {
      id
    }
  }
`;

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

  const userId = result.data.insert_auth_users_one.id;

  const activationTokenGenerated = generateActivationToken(userId);

  try {
    await sendActivateAccountEmail(email, activationTokenGenerated);
  } catch (error) {
    await gqlClient()
      .mutation(deleteQuery, {
        id: userId,
      })
      .toPromise();
    throw new AuthEmailSendError({
      cause: error,
      message: "Impossible to send activation email",
      name: "SEND_EMAIL_ERROR",
    });
  }

  return true;
};
