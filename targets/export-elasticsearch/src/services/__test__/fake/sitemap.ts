import { injectable } from "inversify";

import { wait } from "../../../utils";
import { Environment } from "@socialgouv/cdtn-types";

@injectable()
export class FakeSitemapService {
  async uploadSitemap(
    environment: Environment,
    sitemapEndpoint: string,
    destinationFolder: string,
    sitemapName: string
  ): Promise<void> {
    await wait(100);
  }
}
