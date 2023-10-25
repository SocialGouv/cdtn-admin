import { modelesQuery, ModelRequest, ModelResponse } from "./modeles.query";
import { ApiClient } from "src/lib/api";

export class ModelRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetch(id: string) {
    const { error, data } = await this.client.query<
      ModelResponse,
      ModelRequest
    >(modelesQuery, {
      id,
    });
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error(`Pas de modèles de courrier pour l'id ${id}`);
    }
    return data.model;
  }
}
