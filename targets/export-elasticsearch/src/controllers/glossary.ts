import { Request, Response } from "express";
import { inject } from "inversify";
import type { interfaces } from "inversify-express-utils";
import {
  controller,
  httpPost,
  request,
  response,
} from "inversify-express-utils";

import { GlossaryService } from "../services/glossary";
import { getName } from "../utils";
import type { ValidatorCreateGlossaryType } from "./middlewares";
import { GlossaryMiddleware } from "./middlewares";

@controller("/glossary")
export class GlossaryController implements interfaces.Controller {
  constructor(
    @inject(getName(GlossaryService))
    private readonly service: GlossaryService
  ) {}

  @httpPost("/", getName(GlossaryMiddleware))
  async getForOneContent(@request() req: Request) {
    const body: ValidatorCreateGlossaryType = req.body;
    const result = await this.service.getContentWithGlossary(
      body.type,
      body.content
    );
    return {
      result,
    };
  }

  @httpPost("/all")
  async runGlossary(@response() res: Response) {
    res.status(202);
    return this.service.runGlossaryForAllContent();
  }
}
