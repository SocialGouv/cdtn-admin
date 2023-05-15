import { injectable } from "inversify";

import { wait } from "../../../utils";

@injectable()
export class FakeSitemapService {
  async getSitemap(
    destinationContainer: string,
    destinationName: string
  ): Promise<string> {
    await wait(100);
    return "";
  }

  async uploadSitemap(
    sitemapEndpoint: string,
    destinationContainer: string,
    destinationName: string
  ): Promise<void> {
    await wait(100);
  }
}
