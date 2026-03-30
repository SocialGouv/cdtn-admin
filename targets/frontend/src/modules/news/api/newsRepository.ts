import { NewsRequest, NewsResponse, selectNewsQuery } from "./news.query";
import { ApiClient } from "src/lib/api";
import { News } from "../type";

export class NewsRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetch(id: string): Promise<News> {
    const { error, data } = await this.client.query<NewsResponse, NewsRequest>(
      selectNewsQuery,
      {
        id,
      }
    );
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error(`Pas d'actualité pour l'id ${id}`);
    }
    return data.news;
  }
}
