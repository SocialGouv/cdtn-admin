import { inject, injectable } from "inversify";

import { AzureRepository } from "../repositories";
import { getName, name } from "../utils";

@injectable()
@name("SitemapService")
export class SitemapService {
  constructor(
    @inject(getName(AzureRepository))
    private readonly repo: AzureRepository
  ) {}

  async getSitemap(
    destinationContainer = process.env.SITEMAP_DESTINATION_CONTAINER ??
      "sitemap",
    destinationName = process.env.SITEMAP_DESTINATION_NAME ?? "sitemap-xml"
  ): Promise<string> {
    return this.repo.getFile(destinationContainer, destinationName);
  }

  async uploadSitemap(
    sitemapEndpoint = process.env.SITEMAP_ENDPOINT ?? "http://www/sitemap.xml",
    destinationContainer = process.env.SITEMAP_DESTINATION_CONTAINER ??
      "sitemap",
    destinationName = process.env.SITEMAP_DESTINATION_NAME ?? "sitemap-xml"
  ): Promise<void> {
    return this.repo.uploadFile(
      sitemapEndpoint,
      destinationContainer,
      destinationName
    );
  }
}
