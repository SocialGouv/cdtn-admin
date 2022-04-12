import { Response } from "express";
import { inject } from "inversify";
import type { interfaces } from "inversify-express-utils";
import {
  controller,
  httpGet,
  httpPost,
  response,
} from "inversify-express-utils";

import { SitemapService } from "../services/sitemap";
import { getName } from "../utils";

@controller("/sitemap")
export class SitemapController implements interfaces.Controller {
  constructor(
    @inject(getName(SitemapService))
    private readonly service: SitemapService
  ) {}

  @httpPost("/")
  async upload(@response() res: Response): Promise<void> {
    await this.service.uploadSitemap("", "", "");
    res.status(200).send();
  }

  @httpGet("/")
  async get(): Promise<string> {
    return this.service.getSitemap("", "");
  }
}
