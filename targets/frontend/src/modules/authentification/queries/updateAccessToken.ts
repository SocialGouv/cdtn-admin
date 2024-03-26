export const updateAccessTokenMutation = `
  mutation updateAccessToken($id: uuid!, $accessToken: String!) {
    update_auth_users_by_pk(
      pk_columns: {id: $id},
      _set: {accessToken: $accessToken}
    ) {
      id
      accessToken
    }
  }
`;

export interface UpdateAccessTokenHasuraResult {
  update_auth_users_by_pk: {
    id: string;
    accessToken: string;
  };
}
