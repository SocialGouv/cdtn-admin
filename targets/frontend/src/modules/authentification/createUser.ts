import { gqlClient } from "@shared/utils";
import { gql } from "urql";
import { AuthGqlError } from "./errors";
import { UserSignedIn } from "./signIn";

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
  const result = await gqlClient()
    .mutation<InsertUserHasuraResult>(insertQuery, {
      name,
      email,
      role: "super" as UserSignedIn["role"],
    })
    .toPromise();

  if (result.error || !result.data?.insert_auth_users_one.id) {
    throw new AuthGqlError({
      cause: result.error,
      message: "Impossible to register user",
      name: "AUTH_GQL_ERROR",
    });
  }

  return true;
};
