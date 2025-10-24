import {
  InfographicRequest,
  InfographicResponse,
  infographicsQuery
} from "./infographic.query";
import { ApiClient } from "src/lib/api";
import { Infographic } from "../type";

export class InfographicRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetch(id: string): Promise<Infographic> {
    const { error, data } = await this.client.query<
      InfographicResponse,
      InfographicRequest
    >(infographicsQuery, {
      id
    });
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error(`Pas d'infographie pour l'id ${id}`);
    }
    return data.infographic;
  }
}
