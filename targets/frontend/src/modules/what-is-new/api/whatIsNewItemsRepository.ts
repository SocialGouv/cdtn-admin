import { ApiClient } from "src/lib/api";
import {
  whatIsNewItemsQuery,
  WhatIsNewItemsResponse,
  WhatIsNewItemRow,
} from "./whatIsNewItems.query";

export class WhatIsNewItemsRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetchAll(): Promise<WhatIsNewItemRow[]> {
    const { error, data } = await this.client.query<WhatIsNewItemsResponse>(
      whatIsNewItemsQuery,
      {}
    );
    if (error) {
      throw error;
    }
    if (!data) {
      return [];
    }
    return data.items ?? [];
  }
}