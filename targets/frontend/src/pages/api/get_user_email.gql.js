export const getUserEmailQuery = `
  query get_user_email(
    $secret_token: uuid!
  ) {
    users: auth_users (
      where: {
        secret_token: { _eq: $secret_token }
      }
    ) {
      email
    }
  }
  `;
