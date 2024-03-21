export const getAccessTokenQuery = `
  query getAccessToken($email: String!) {
    auth_users(where: {email: {_eq: $email}}) {
      id
      accessToken
    }
  }
`;

export interface GetAccessTokenHasuraResult {
  auth_users: {
    id: string;
    accessToken: string;
  }[];
}
