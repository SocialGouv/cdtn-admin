import type { ExportEsStatus } from "@shared/types";
import { Environment } from "@shared/types";
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
import { getName } from "../utils";
import type { ValidatorCreateExportEsStatusType } from "./middlewares";
import { ExportEsRunMiddleware } from "./middlewares";

@controller("/export")
export class ExportController implements interfaces.Controller {
  constructor(
    @inject(getName(ExportService))
    private readonly service: ExportService
  ) {}

  @httpPost("/", getName(ExportEsRunMiddleware))
  async run(@request() req: Request, @response() res: Response): Promise<void> {
    const body: ValidatorCreateExportEsStatusType = req.body;
    res.status(202);
    await this.service.runExport(body.userId, body.environment);
  }

  @httpGet("/")
  async getExportsStatus(
    @queryParam("environment") environment?: Environment
  ): Promise<ExportEsStatus[]> {
    return this.service.getAll(environment);
  }

  @httpGet("/latest")
  async getLatestExportEs(): Promise<{
    preproduction: ExportEsStatus;
    production: ExportEsStatus;
  }> {
    return this.service.getLatest();
  }
}
