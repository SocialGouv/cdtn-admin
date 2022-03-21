import { Response } from "express";
import { inject } from "inversify";
import type { interfaces } from "inversify-express-utils";
import { controller, httpPost, response } from "inversify-express-utils";

import { ExportService } from "../services/export";
import type { Status } from "../types";
import { getName } from "../utils";

@controller("/export")
export class ExportController implements interfaces.Controller {
  constructor(
    @inject(getName(ExportService))
    private readonly service: ExportService
  ) {}

  @httpPost("/run")
  run(@response() res: Response): { status: Status } {
    res.status(202);
    return this.service.runExport();
  }
}
