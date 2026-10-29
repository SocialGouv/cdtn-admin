import {
  mapNewsRow,
  NewsRequest,
  NewsResponse,
  selectNewsQuery,
} from "./news.query";
import { ApiClient } from "src/lib/api";
import { News } from "../type";
import { updateNewsPublicationMutation } from "./news.mutation";

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
    if (!data?.news) {
      throw new Error(`Pas d'actualité pour l'id ${id}`);
    }
    return mapNewsRow(data.news);
  }

  async updatePublication(
    id: string,
    displayDate: string,
    publishedAt: string
  ): Promise<void> {
    const { error } = await this.client.mutation(
      updateNewsPublicationMutation,
      { id, displayDate, publishedAt }
    );
    if (error) {
      throw error;
    }
  }
}
