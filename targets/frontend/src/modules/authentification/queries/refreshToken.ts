export const refreshTokenMutation = `
  mutation insertRefreshToken (
    $refresh_token_data: auth_refresh_tokens_insert_input!
  ) {
    insert_data: insert_auth_refresh_tokens (
      objects: [$refresh_token_data]
    ) {
      returning {
        refresh_token
      }
    }
  }
`;
