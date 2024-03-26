import { LightUser } from "../jwt";

export const getLightUserQuery = `
  query getAccessToken($accessToken: String!, $refreshToken: String!) {
    auth_users(where: {accessToken: {_eq: $accessToken}, isActive: {_eq: true}, isDeleted: {_eq: false}, refreshToken: {_eq: $refreshToken}}) {
      id
      name
      email
      accessToken
      expiresIn
    }
  }
`;

export interface GetLightUserHasuraResult {
  auth_users: LightUser[];
}
