import { gqlClient } from "@shared/utils";
import { hash } from "argon2";
import { gql } from "urql";
import { AuthGqlError } from "./utils/errors";
import { getAndVerifyActivationToken } from "./utils/jwt";

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
  mutation updatePasswordAndIsActive($id: uuid!, $password: String!) {
    update_auth_users_by_pk(
      pk_columns: { id: $id }
      _set: { password: $password, isActive: true }
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

export const activateUser = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const { id } = await getAndVerifyActivationToken(token);

  const getUserResult = await gqlClient()
    .query<GetUserHasuraResult>(getUserQuery, {
      id,
    })
    .toPromise();

  if (getUserResult.error || !getUserResult.data?.auth_users_by_pk) {
    throw new AuthGqlError({
      cause: getUserResult.error,
      message: "User not found",
      name: "AUTH_GQL_ERROR",
    });
  }

  const password = await hash(newPassword);

  const result = await gqlClient()
    .mutation<UpdateUserHasuraResult>(updateQuery, {
      id,
      password,
    })
    .toPromise();

  if (result.data?.update_auth_users_by_pk.id !== id || result.error) {
    throw new AuthGqlError({
      cause: result.error,
      message: "Error to activate user",
      name: "AUTH_GQL_ERROR",
    });
  }
};
