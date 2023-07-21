import type { interfaces } from "inversify-express-utils";
import {
  controller,
  httpDelete,
  httpGet,
  httpPost,
  queryParam,
  requestParam,
} from "inversify-express-utils";
import { getName } from "../utils";
import { inject } from "inversify";
import { EmbeddingService } from "../services";
import { CollectionSlug } from "../type";
import { SOURCES } from "@socialgouv/cdtn-utils";

@controller("/embedding")
export class EmbeddingController implements interfaces.Controller {
  constructor(
    @inject(getName(EmbeddingService))
    private readonly service: EmbeddingService
  ) {}

  @httpPost("/:slug")
  async ingestServicePublic(
    @requestParam("slug") slug: CollectionSlug
  ): Promise<Record<string, any>> {
    switch (slug) {
      case CollectionSlug.SERVICE_PUBLIC:
        return await this.service.ingestServicePublicDocuments();
      case CollectionSlug.CONTRIBUTION:
        return await this.service.ingestContributionDocuments();
      default:
        return { error: "Unknown slug" };
    }
  }

  @httpGet("/:slug")
  async getServicePublic(
    @requestParam("slug") slug: CollectionSlug,
    @queryParam("q") query: string
  ): Promise<Record<string, any>> {
    if (!query) {
      return { error: "Missing query parameter" };
    }
    switch (slug) {
      case CollectionSlug.SERVICE_PUBLIC:
        return await this.service.getServicePublicDocuments(query);
      case CollectionSlug.CONTRIBUTION:
        return await this.service.getContributionDocuments(query);
      default:
        return { error: "Unknown slug" };
    }
  }

  @httpGet("/:slug/infos")
  async infos(
    @requestParam("slug") slug: CollectionSlug
  ): Promise<Record<string, any>> {
    switch (slug) {
      case CollectionSlug.SERVICE_PUBLIC:
        return await this.service.countAndPeekServicePublicDocuments();
      case CollectionSlug.CONTRIBUTION:
        return await this.service.countAndPeekContributionDocuments();
      default:
        return { error: "Unknown slug" };
    }
  }

  @httpGet("/:slug/source")
  async getHasura(
    @requestParam("slug") slug: CollectionSlug
  ): Promise<Record<string, any>> {
    switch (slug) {
      case CollectionSlug.SERVICE_PUBLIC:
        return await this.service.getHasuraDocumentBySource(SOURCES.SHEET_SP);
      case CollectionSlug.CONTRIBUTION:
        return await this.service.getHasuraDocumentBySource(
          SOURCES.CONTRIBUTIONS
        );
      default:
        return { error: "Unknown slug" };
    }
  }

  @httpGet("/:slug/list")
  async list(
    @requestParam("slug") slug: CollectionSlug
  ): Promise<Record<string, any>> {
    switch (slug) {
      case CollectionSlug.SERVICE_PUBLIC:
        return await this.service.listServicePublicDocumentsMetadata();
      case CollectionSlug.CONTRIBUTION:
        return await this.service.listContributionDocumentsMetadata();
      default:
        return { error: "Unknown slug" };
    }
  }

  @httpDelete("/:slug/delete")
  async delete(
    @requestParam("slug") slug: CollectionSlug
  ): Promise<Record<string, any>> {
    switch (slug) {
      case CollectionSlug.SERVICE_PUBLIC:
        return await this.service.cleanServicePublicDocuments();
      case CollectionSlug.CONTRIBUTION:
        return await this.service.cleanContributionDocuments();
      default:
        return { error: "Unknown slug" };
    }
  }
}
