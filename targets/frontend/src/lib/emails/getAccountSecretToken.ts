import { client as gqlClient } from "@shared/graphql-client";
import { gql } from "@urql/core";

const getUserSecretTokenRequest = gql`
  query GetUserSecretToken($email: citext!) {
    auth_users(
      where: {
        email: { _eq: $email }
        deleted: { _eq: false }
        active: { _eq: false }
      }
    ) {
      secret_token
    }
  }
`;

export async function getUserSecretToken(email: string) {
  const result = await gqlClient
    .query<{ auth_users: [{ secret_token: string }] }, { email: string }>(
      getUserSecretTokenRequest,
      {
        email,
      }
    )
    .toPromise();
  if (result.error) {
    console.error("[getUserSecretToken]", result.error);
    throw result.error;
  }
  return result?.data?.auth_users?.[0]?.secret_token!!;
}
