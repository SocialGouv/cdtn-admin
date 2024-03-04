import { inject, injectable } from "inversify";

import { S3Repository } from "../repositories";
import { getName, name } from "../utils";
import { Environment } from "@shared/types";

@injectable()
@name("SitemapService")
export class SitemapService {
  constructor(
    @inject(getName(S3Repository))
    private readonly repo: S3Repository
  ) {}

  async uploadSitemap(
    environment: Environment,
    sitemapEndpoint = process.env.SITEMAP_ENDPOINT ?? "",
    destinationFolder = process.env.SITEMAP_DESTINATION_FOLDER ?? "",
    sitemapName = process.env.SITEMAP_NAME ?? ""
  ): Promise<void> {
    await this.repo.uploadSitemap(
      environment,
      sitemapEndpoint,
      destinationFolder,
      sitemapName
    );
  }
}
