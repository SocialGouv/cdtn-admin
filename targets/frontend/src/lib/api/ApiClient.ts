import { Client } from "urql";
import { DocumentNode } from "graphql/index";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { OperationContext, OperationResult } from "@urql/core/dist/types/types";
import { gqlClient } from "@shared/utils";

export class ApiClient {
  client: Client;
  hasuraGraphqlAdminSecret: string;
  sessionVariables?: any;

  constructor(client: Client, sessionVariables?: any) {
    this.client = client;
    this.hasuraGraphqlAdminSecret =
      process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? "admin1";
    this.sessionVariables = sessionVariables;
  }

  public static build(sessionVariables: any = undefined): ApiClient {
    return new ApiClient(gqlClient(), sessionVariables);
  }

  async query<Data = any, Variables extends object = {}>(
    query: DocumentNode | TypedDocumentNode<Data, Variables> | string,
    variables?: Variables,
    context?: Partial<OperationContext>
  ): Promise<OperationResult<Data, Variables>> {
    let headers = context?.headers;
    if (this.sessionVariables) {
      headers = {
        ...headers,
        ...this.sessionVariables,
        "x-hasura-admin-secret": this.hasuraGraphqlAdminSecret,
      };
    }
    const result = await this.client
      .query(query, variables, {
        ...context,
        fetchOptions: () => ({
          ...context?.fetchOptions,
          headers,
        }),
      })
      .toPromise();

    return result;
  }

  async mutation<Data = any, Variables extends object = {}>(
    query: DocumentNode | TypedDocumentNode<Data, Variables> | string,
    variables?: Variables,
    context?: Partial<OperationContext>
  ): Promise<OperationResult<Data, Variables>> {
    let headers = context?.headers;
    if (this.sessionVariables) {
      headers = {
        ...headers,
        ...this.sessionVariables,
        "x-hasura-admin-secret": this.hasuraGraphqlAdminSecret,
      };
    }
    const result = await this.client
      .mutation(query, variables, {
        ...context,
        fetchOptions: () => ({
          ...context?.fetchOptions,
          headers,
        }),
      })
      .toPromise();

    return result;
  }
}
