export type LoginQueryUserResponse = {
  id: string;
  password: string;
  active: boolean;
  deleted: boolean;
  name: string;
  default_role: string;
  roles: [{ role: string }];
};

export type LoginQueryResponse = {
  users: LoginQueryUserResponse[];
};

export type LoginQueryVariables = {
  username: string;
};

export const loginQuery = `
  query login(
    $username: citext!
  ) {
    users: auth_users (
      where: {
        email: { _eq: $username}
      }
    ) {
      id
      password
      active
      deleted
      name
      default_role
      roles: user_roles {
        role
      }
    }
  }
  `;

export type RefreshTokenMutationVariables = {
  refresh_token_data: {
    expires_at: Date;
    user_id: string;
  };
};

export type RefreshTokenMutationResponse = {
  insert_data: {
    returning: {
      refresh_token: string;
    }[];
  };
};

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
