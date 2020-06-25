import { Client } from '@urql/core';

declare module '@shared/graphql-client' {
  export const client: Client
}
