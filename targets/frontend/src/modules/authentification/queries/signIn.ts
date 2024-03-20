import { Session } from "next-auth";

export const signInQuery = `
  query login($email: citext!) {
    auth_users(where: {email: {_eq: $email}}) {
      id
      password
      name
      isActive
      isDeleted
      created_at
      role
    }
  }
`;

export interface LoginHasuraResult {
  auth_users: Required<
    Session["user"] & {
      password: string;
    }
  >[];
}
