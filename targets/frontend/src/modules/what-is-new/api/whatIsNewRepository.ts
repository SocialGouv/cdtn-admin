import {
  WhatIsNewMonthRequest,
  WhatIsNewMonthResponse,
  whatIsNewMonthQuery,
} from "./whatIsNew.query";
import { ApiClient } from "src/lib/api";
import { WhatIsNewMonth } from "../type";

export class WhatIsNewRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetch(id: string): Promise<WhatIsNewMonth> {
    const { error, data } = await this.client.query<
      WhatIsNewMonthResponse,
      WhatIsNewMonthRequest
    >(whatIsNewMonthQuery, {
      id,
    });
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error(`Pas de mois "Quoi de neuf ?" pour l'id ${id}`);
    }
    return data.month;
  }
}