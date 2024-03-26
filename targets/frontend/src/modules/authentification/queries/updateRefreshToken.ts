export const updateRefreshTokenMutation = `
  mutation updateRefreshToken($id: uuid!, $refreshToken: String!, $accessToken: String!, $expiresIn: timestamptz!) {
    update_auth_users_by_pk(
      pk_columns: {id: $id},
      _set: {refreshToken: $refreshToken, accessToken: $accessToken, expiresIn: $expiresIn}
    ) {
      id
      refreshToken
      accessToken
      expiresIn
    }
  }
`;

export interface UpdateRefreshTokenHasuraResult {
  update_auth_users_by_pk: {
    id: string;
    refreshToken: string;
    accessToken: string;
    expiresIn: string;
  };
}
