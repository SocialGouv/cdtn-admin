import { ApiClient } from "src/lib/api";
import {
  whatIsNewItemByIdQuery,
  type WhatIsNewItemByIdResponse,
  type WhatIsNewItemRow,
} from "./whatIsNewItems.query";

export class WhatIsNewItemsRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetchById(id: string): Promise<WhatIsNewItemRow | null> {
    const { error, data } = await this.client.query<
      WhatIsNewItemByIdResponse,
      { id: string }
    >(whatIsNewItemByIdQuery, { id });

    if (error) {
      throw error;
    }

    return data?.item ?? null;
  }
}
