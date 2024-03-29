import { gqlClient } from "@shared/utils";
import { hash, verify } from "argon2";
import { gql } from "urql";
import { AuthGqlError, AuthUserPasswordDifferent } from "./errors";

const getUserQuery = gql`
  query getUser($id: uuid!) {
    auth_users_by_pk(id: $id) {
      password
      isDeleted
      isActive
    }
  }
`;

interface GetUserHasuraResult {
  auth_users_by_pk: {
    password: string;
  };
}

const updateQuery = gql`
  mutation updatePassword($id: uuid!, $password: String!) {
    update_auth_users_by_pk(
      pk_columns: { id: $id }
      _set: { password: $password }
    ) {
      id
    }
  }
`;

interface UpdateUserHasuraResult {
  update_auth_users_by_pk: {
    id: string;
  };
}

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<boolean> => {
  const getUserResult = await gqlClient()
    .query<GetUserHasuraResult>(getUserQuery, {
      id: userId,
    })
    .toPromise();

  if (getUserResult.error || !getUserResult.data?.auth_users_by_pk) {
    throw new AuthGqlError({
      cause: getUserResult.error,
      message: "Error to get user",
      name: "AUTH_GQL_ERROR",
    });
  }

  const userPassword = getUserResult.data.auth_users_by_pk.password;

  const match = await verify(userPassword, oldPassword);

  if (!match) {
    throw new AuthUserPasswordDifferent({
      message: "Old password is different from the one stored in database",
      name: "AUTH_USER_PASSWORD_DIFFERENT",
      cause: null,
    });
  }

  const password = await hash(newPassword);

  const result = await gqlClient()
    .mutation<UpdateUserHasuraResult>(updateQuery, {
      id: userId,
      password,
    })
    .toPromise();

  if (result.data?.update_auth_users_by_pk.id !== userId || result.error) {
    return false;
  }

  return true;
};
