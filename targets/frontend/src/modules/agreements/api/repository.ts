import { agreementQuery, AgreementRequest, AgreementResponse } from "./query";
import { ApiClient } from "src/lib/api";

export class AgreementRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetch(id: string) {
    const { error, data } = await this.client.query<
      AgreementResponse,
      AgreementRequest
    >(agreementQuery, {
      id,
    });
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error(`Pas de convention collective pour l'id ${id}`);
    }
    return data.agreement;
  }
}
