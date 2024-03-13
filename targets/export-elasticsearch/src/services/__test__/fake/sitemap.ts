import { injectable } from "inversify";

import { wait } from "../../../utils";

@injectable()
export class FakeSitemapService {
  async uploadSitemap(
    sitemapEndpoint: string,
    destinationContainer: string,
    destinationName: string
  ): Promise<void> {
    await wait(100);
  }
}
