import {
  informationsQuery,
  InformationsRequest,
  InformationsResponse,
} from "./informations.query";
import { ApiClient } from "src/lib/api";

export class InformationsRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetchInformation(id: string) {
    const { error, data } = await this.client.query<
      InformationsResponse,
      InformationsRequest
    >(informationsQuery, {
      id,
    });
    if (error) {
      console.log("Error: ", error);
      throw error;
    }
    if (!data || data.information_informations.length === 0) {
      throw new Error(`Pas de page information pour l'id ${id}`);
    }
    const information = data.information_informations[0];
    return information;
  }
}
