import { client } from "@shared/graphql-client";
import {
  getAgreements,
  getAnswers,
  getLocations,
  getQuestions,
  updateAgreement,
  updateQuestion,
} from "./graphql";

export class GraphQLApi {
  constructor() {
    this.client = client;
  }

  async fetchWithPagination(data, variables = undefined) {
    const res = await this.client
      .query(data.query, variables ? variables : {})
      .toPromise();

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

  async fetch(graphQL, variables = undefined) {
    const res = await this.client.query(graphQL.query, variables).toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data[graphQL.key]) {
      throw new Error("Failed to get, undefined object");
    }
    return res.data[graphQL.key];
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

  async create(graphQL, data) {
    const res = await this.client.mutation(graphQL.query, data).toPromise();

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
    const res = await this.client.mutation(graphQL.query, data).toPromise();

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
    const res = await this.client.mutation(graphQL.query, data).toPromise();

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
