import { Request, Response } from "express";
import { inject } from "inversify";
import type { interfaces } from "inversify-express-utils";
import {
  controller,
  httpGet,
  httpPost,
  queryParam,
  request,
  response,
} from "inversify-express-utils";

import { ExportService } from "../services/export";
import type { ExportEsStatus } from "../types";
import { Environment } from "../types";
import { getName } from "../utils";
import { ExportEsRunMiddleware } from "./middlewares";
import type { CreateExportEsStatusType } from "./schemas";

@controller("/export")
export class ExportController implements interfaces.Controller {
  constructor(
    @inject(getName(ExportService))
    private readonly service: ExportService
  ) {}

  @httpPost("/", getName(ExportEsRunMiddleware))
  async run(
    @request() req: Request,
    @response() res: Response
  ): Promise<ExportEsStatus> {
    const body: CreateExportEsStatusType = req.body;
    res.status(202);
    return this.service.runExport(body.userId, body.environment);
  }

  @httpGet("/")
  async getExportsStatus(
    @queryParam("environment") environment?: Environment
  ): Promise<ExportEsStatus[] | undefined> {
    return this.service.getAll(environment);
  }
}
