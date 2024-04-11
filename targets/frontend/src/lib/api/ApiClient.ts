import { DocumentNode } from "graphql/index";
import { OperationContext, OperationResult, TypedDocumentNode } from "urql";
import { gqlClient, GqlClient } from "@shared/utils";

export class ApiClient {
  client: GqlClient;
  hasuraGraphqlAdminSecret: string;
  sessionVariables?: any;

  constructor(client: GqlClient, sessionVariables?: any) {
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
    variables: Variables,
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
      .query<Data, Variables>(query, variables, {
        ...(context as any),
        fetchOptions: () => ({
          ...context?.fetchOptions,
          headers,
        }),
      })
      .toPromise();

    return result as any;
  }

  async mutation<Data = any, Variables extends object = {}>(
    query: DocumentNode | TypedDocumentNode<Data, Variables> | string,
    variables: Variables,
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
        ...(context as any),
        fetchOptions: () => ({
          ...context?.fetchOptions,
          headers,
        }),
      })
      .toPromise();

    return result as any;
  }
}
