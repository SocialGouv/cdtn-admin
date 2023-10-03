import {
  informationsQuery,
  InformationsRequest,
  InformationsResponse,
} from "./informations.query";
import { ApiClient, NotFoundError } from "src/lib/api";
import { QueryInformation } from "../components/informationsList/InformationsList.query";

export class InformationsRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetchInformation(id: string): Promise<QueryInformation> {
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
      throw new NotFoundError({
        message: `No Informations document found for ${id}`,
        name: "NOT_FOUND",
        cause: null,
      });
    }

    return data.information_informations[0];
  }
}
