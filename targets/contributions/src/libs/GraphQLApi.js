import {
  getAgreements,
  getAnswers,
  getLocations,
  getQuestions,
  updateAgreement,
  updateQuestion,
} from "./graphql";
import { createClient } from "@urql/core";
import fetch from "isomorphic-unfetch";
import { RefreshToken } from "./RefreshToken";

export class GraphQLApi {
  constructor() {
    this.client = createClient({
      fetch,
      fetchOptions: {
        headers: {
          "Content-Type": "application/json",
        },
      },
      requestPolicy: "network-only",
      url: "/api/graphql",
    });
    this.refreshToken = new RefreshToken();
  }

  async queryWithToken(query, variables) {
    const res = await this.client.query(query, variables).toPromise();

    if (
      res.error &&
      res.error.message === "[GraphQL] Could not verify JWT: JWTExpired"
    ) {
      if (await this.refreshToken.refresh()) {
        return await this.client.query(query, variables).toPromise();
      }
    }

    return res;
  }

  async fetchWithPagination(data, variables = undefined) {
    const res = await this.queryWithToken(
      data.query,
      variables ? variables : {}
    );

    if (res.error) {
      throw res.error;
    }
    if (!res.data[data.key]) {
      throw new Error("Failed to get, undefined object");
    }
    if (!res.data[`${data.key}_aggregate`]) {
      throw new Error("Failed to get, undefined object");
    }
    const { totalCount } = res.data[`${data.key}_aggregate`].aggregate;

    return {
      data: res.data[data.key],
      pagesLength: Math.ceil(totalCount / variables.limit),
      totalLength: totalCount,
    };
  }

  async fetch(data, variables = undefined) {
    const res = await this.queryWithToken(data.query, variables);
    if (res.error) {
      throw res.error;
    }
    if (!res.data[data.key]) {
      throw new Error("Failed to get, undefined object");
    }
    return res.data[data.key];
  }

  async fetchAll(key, variables = {}) {
    let graphQL = null;
    switch (key) {
      case "/agreements":
        graphQL = getAgreements;
        break;
      case "/questions":
        graphQL = getQuestions;
        break;
      case "/answers":
        graphQL = getAnswers;
        break;
      case "/locations":
        graphQL = getLocations;
        break;
      default:
        throw Error(`Unsupported key ${key}`);
    }
    return this.fetch(graphQL, variables);
  }

  async mutationWithToken(query, variables) {
    const res = await this.client.mutation(query, variables).toPromise();

    if (
      res.error &&
      res.error.message === "[GraphQL] Could not verify JWT: JWTExpired"
    ) {
      if (await this.refreshToken.refresh()) {
        return await this.client.mutation(query, variables).toPromise();
      }
    }

    return res;
  }

  async create(graphQL, data) {
    const res = await this.mutationWithToken(graphQL.query, data);

    if (res.error) {
      throw res.error;
    }
    if (!res.data[graphQL.key]) {
      throw new Error("Failed to create, undefined object");
    }

    return res.data[graphQL.key];
  }

  async updateWithKey(key, data) {
    let graphQL = null;
    switch (key) {
      case "/agreements":
        graphQL = updateAgreement;
        break;
      case "/questions":
        graphQL = updateQuestion;
        break;
      default:
        throw Error(`Unsupported key ${key}`);
    }
    return this.update(graphQL, data);
  }

  async update(graphQL, data) {
    const res = await this.mutationWithToken(graphQL.query, data);

    if (res.error) {
      throw res.error;
    }
    if (!res.data[graphQL.key]) {
      throw new Error("Failed to create, undefined object");
    }
    if (
      !res.data[graphQL.key].returning ||
      res.data[graphQL.key].returning.length === 0
    ) {
      throw new Error("Failed to create, no data in reponse");
    }
    return res.data[graphQL.key].returning[0];
  }

  async delete(graphQL, data) {
    const res = await this.mutationWithToken(graphQL.query, data).toPromise();

    if (res.error) {
      throw res.error;
    }
    if (!res.data[graphQL.key]) {
      throw new Error("Failed to delete, undefined object");
    }
    if (res.data[graphQL.key].returning) {
      return res.data[graphQL.key].returning;
    }
    return null;
  }
}

export const api = new GraphQLApi();
