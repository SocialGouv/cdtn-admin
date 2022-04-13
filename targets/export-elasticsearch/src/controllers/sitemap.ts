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

  @httpGet("/")
  async get(@response() res: Response): Promise<void> {
    let result = "";
    try {
      result = await this.service.getSitemap();
    } catch (e: unknown) {
      res.status(500).send({
        error: e instanceof Error ? e.message : "Erreur non déterminée",
      });
    }
    res.status(200).set("content-type", "text/xml").send(result);
  }

  @httpPost("/")
  async upload(@response() res: Response): Promise<void> {
    try {
      await this.service.uploadSitemap();
    } catch (e: unknown) {
      res.status(500).send({
        error: e instanceof Error ? e.message : "Erreur non déterminée",
      });
    }
    res.status(200).send({ isSuccess: true });
  }
}
