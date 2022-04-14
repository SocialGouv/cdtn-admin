import { inject, injectable } from "inversify";

import { AzureRepository } from "../repositories";
import { getName, name } from "../utils";

@injectable()
@name(SitemapService.name)
export class SitemapService {
  constructor(
    @inject(getName(AzureRepository))
    private readonly repo: AzureRepository
  ) {
    this.repo = new AzureRepository(
      process.env.AZ_ACCOUNT_NAME ?? "",
      process.env.AZ_ACCOUNT_KEY ?? "",
      process.env.AZ_URL ??
        `https://${process.env.AZ_ACCOUNT_NAME}.blob.core.windows.net`
    );
  }

  async getSitemap(
    destinationContainer = process.env.DESTINATION_CONTAINER ?? "sitemap",
    destinationName = process.env.DESTINATION_NAME ?? "sitemap-xml"
  ): Promise<string> {
    return this.repo.getFile(destinationContainer, destinationName);
  }

  async uploadSitemap(
    sitemapEndpoint = process.env.SITEMAP_ENDPOINT ?? "http://www/sitemap.xml",
    destinationContainer = process.env.DESTINATION_CONTAINER ?? "sitemap",
    destinationName = process.env.DESTINATION_NAME ?? "sitemap-xml"
  ): Promise<void> {
    return this.repo.uploadFile(
      sitemapEndpoint,
      destinationContainer,
      destinationName
    );
  }
}
