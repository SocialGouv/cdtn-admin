import { inject, injectable } from "inversify";

import { S3Repository } from "../repositories";
import { getName, name } from "../utils";

@injectable()
@name("SitemapService")
export class SitemapService {
  constructor(
    @inject(getName(S3Repository))
    private readonly repo: S3Repository
  ) {}

  async getSitemap(
    destinationFolder = process.env.SITEMAP_DESTINATION_FOLDER ?? "",
    sitemapName = process.env.SITEMAP_NAME ?? ""
  ): Promise<string> {
    const data = await this.repo.getFile(sitemapName, destinationFolder, true);
    return data;
  }

  async uploadSitemap(
    sitemapEndpoint = process.env.SITEMAP_ENDPOINT ?? "",
    destinationFolder = process.env.SITEMAP_DESTINATION_FOLDER ?? "",
    sitemapName = process.env.SITEMAP_NAME ?? ""
  ): Promise<void> {
    await this.repo.uploadSitemap(
      sitemapEndpoint,
      destinationFolder,
      sitemapName
    );
  }
}
