import { injectable } from "inversify";

import { wait } from "../../../utils";

@injectable()
export class FakeSitemapService {
  async uploadSitemap(): Promise<void> {
    await wait(100);
  }
}
