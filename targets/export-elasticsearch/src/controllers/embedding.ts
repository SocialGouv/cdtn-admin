import type { interfaces } from "inversify-express-utils";
import {
  controller,
  httpGet,
  httpPost,
  params,
  queryParam,
  requestParam,
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

  @httpPost("/:slug")
  async ingestServicePublic(
    @requestParam("slug") slug: string
  ): Promise<Record<string, any>> {
    switch (slug) {
      case "service-public":
        return await this.service.ingestServicePublicDocuments();
      case "contribution":
        return await this.service.ingestContributionDocuments();
      default:
        return { error: "Unknown slug" };
    }
  }

  @httpGet("/:slug")
  async getServicePublic(
    @requestParam("slug") slug: string,
    @queryParam("q") query: string
  ): Promise<Record<string, any>> {
    if (!query) {
      return { error: "Missing query parameter" };
    }
    switch (slug) {
      case "service-public":
        return await this.service.getServicePublicDocuments(query);
      case "contribution":
        return await this.service.getContributionDocuments(query);
      default:
        return { error: "Unknown slug" };
    }
  }

  @httpGet("/:slug/infos")
  async infos(
    @requestParam("slug") slug: string
  ): Promise<Record<string, any>> {
    switch (slug) {
      case "service-public":
        return await this.service.countAndPeekServicePublicDocuments();
      case "contribution":
        return await this.service.countAndPeekContributionDocuments();
      default:
        return { error: "Unknown slug" };
    }
  }

  @httpGet("/:slug/list")
  async list(@requestParam("slug") slug: string): Promise<Record<string, any>> {
    switch (slug) {
      case "service-public":
        return await this.service.listServicePublicDocumentsMetadata();
      case "contribution":
        return await this.service.listContributionDocumentsMetadata();
      default:
        return { error: "Unknown slug" };
    }
  }
}
