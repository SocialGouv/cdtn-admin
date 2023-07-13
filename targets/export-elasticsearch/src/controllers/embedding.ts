import type { interfaces } from "inversify-express-utils";
import {
  controller,
  httpGet,
  httpPost,
  queryParam,
} from "inversify-express-utils";
import { getName } from "../utils";
import { inject } from "inversify";
import { EmbeddingService } from "../services";

@controller("/embedding")
export class EmbeddingController implements interfaces.Controller {
  constructor(
    @inject(getName(EmbeddingService))
    private readonly service: EmbeddingService
  ) {}

  @httpGet("/service-public")
  async getServicePublic(
    @queryParam("q") query: string
  ): Promise<Record<string, any>> {
    if (!query) {
      return { error: "Missing query parameter" };
    }
    return await this.service.getServicePublicDocuments(query);
  }

  @httpPost("/service-public")
  async ingestServicePublic(): Promise<Record<string, any>> {
    return await this.service.ingestServicePublicDocuments();
  }

  @httpGet("/service-public/infos")
  async infosServicePublic(): Promise<Record<string, any>> {
    return await this.service.countAndPeekServicePublicDocuments();
  }

  @httpGet("/list")
  async listDocuments(): Promise<Record<string, any>> {
    return await this.service.listAllDocumentsMetadata();
  }
}
