import { Response } from "express";
import { inject } from "inversify";
import type { interfaces } from "inversify-express-utils";
import { controller, httpPost, response } from "inversify-express-utils";

import { CopyContainerService } from "../services";
import { getName } from "../utils";

@controller("/copy")
export class CopyContainerController implements interfaces.Controller {
  constructor(
    @inject(getName(CopyContainerService))
    private readonly service: CopyContainerService
  ) {}

  @httpPost("/")
  async upload(@response() res: Response): Promise<void> {
    await this.service.runCopy();
    res.status(200).send({ isSuccess: true });
  }
}
