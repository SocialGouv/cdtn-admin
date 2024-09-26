import { gqlClient } from "@shared/utils";
import { gql } from "urql";

const deleteQuery = gql`
  mutation deleteUser($id: uuid!, $name: String!, $email: citext!) {
    update_auth_users_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        email: $email
        password: "mot de passe"
        isDeleted: true
      }
    ) {
      name
    }
  }
`;

interface DeleteUserHasuraResult {
  update_auth_users_by_pk: {
    name: string;
  };
}

const anonymizeUser = (userName: string, userId: string): string => {
  if (!userName?.length) return userId.slice(4);
  let anonymous = userName[0].toUpperCase();
  const spaceIndex = userName.indexOf(" ");
  if (spaceIndex && userName.length > spaceIndex) {
    anonymous += userName[spaceIndex + 1].toUpperCase();
  }
  return anonymous;
};

export const deleteUser = async (
  userId: string,
  userName: string
): Promise<boolean> => {
  const deleteResult = await gqlClient()
    .mutation<DeleteUserHasuraResult>(deleteQuery, {
      email: `${userId}@gouv.fr`,
      id: userId,
      name: anonymizeUser(userName, userId),
    })
    .toPromise();

  if (
    deleteResult.data?.update_auth_users_by_pk.name !== userId ||
    deleteResult.error
  ) {
    return false;
  }

  return true;
};
