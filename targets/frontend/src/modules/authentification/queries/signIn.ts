export const signInQuery = `
  query login(
    $email: citext!
  ) {
    users: auth_users (
      where: {
        email: { _eq: $email}
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
