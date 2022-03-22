import { Request, Response } from "express";
import { inject } from "inversify";
import type { interfaces } from "inversify-express-utils";
import {
  controller,
  httpPost,
  request,
  response,
} from "inversify-express-utils";

import { ExportEsRunMiddleware } from "../middlewares";
import type { CreateExportEsStatusType } from "../schemas";
import { ExportService } from "../services/export";
import type { ExportEsStatus } from "../types";
import { getName } from "../utils";

@controller("/export")
export class ExportController implements interfaces.Controller {
  constructor(
    @inject(getName(ExportService))
    private readonly service: ExportService
  ) {}

  @httpPost("/run", getName(ExportEsRunMiddleware))
  async run(
    @request() req: Request,
    @response() res: Response
  ): Promise<ExportEsStatus> {
    const body: CreateExportEsStatusType = req.body;
    res.status(202);
    return this.service.runExport(body.userId, body.environment);
  }
}
