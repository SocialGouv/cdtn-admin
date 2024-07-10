import { ExportEsStatus, Environment } from "@socialgouv/cdtn-types";
import { Request } from "express";
import { inject } from "inversify";
import type { interfaces } from "inversify-express-utils";
import {
  controller,
  httpGet,
  httpPost,
  queryParam,
  request,
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
  async run(@request() req: Request): Promise<{ isRunning: true }> {
    const body: ValidatorCreateExportEsStatusType = req.body;
    const runningResult = await this.service.getRunningExport();
    await this.service.verifyAndCleanPreviousExport(
      runningResult,
      body.environment,
      process.env.DISABLE_LIMIT_EXPORT ? 0 : 15
    );
    this.service.runExport(body.userId, body.environment);
    return {
      isRunning: true,
    };
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
