import type { ExportEsStatus } from "@shared/types";
import { Environment, Status } from "@shared/types";
import { logger } from "@socialgouv/cdtn-logger";
import { randomUUID } from "crypto";
import { inject, injectable } from "inversify";

import { ExportRepository } from "../repositories";
import { getName, name } from "../utils";
import {
  runWorkerIngesterPreproduction,
  runWorkerIngesterProduction,
} from "../workers";
import { CopyContainerService } from "./copy";
import { SitemapService } from "./sitemap";

@injectable()
@name("ExportService")
export class ExportService {
  constructor(
    @inject(getName(ExportRepository))
    private readonly exportRepository: ExportRepository,
    @inject(getName(SitemapService))
    private readonly sitemapService: SitemapService,
    @inject(getName(CopyContainerService))
    private readonly copyContainerService: CopyContainerService
  ) {}

  async runExport(userId: string, environment: Environment): Promise<void> {
    logger.info(`[${userId}] run export for ${environment}`);
    let isReadyToRun = false;
    const runningResult = await this.getRunningExport();
    if (runningResult.length > 0) {
      isReadyToRun = await this.cleanPreviousExport(
        runningResult[0],
        process.env.DISABLE_LIMIT_EXPORT ? 0 : 1
      ); // we can avoid to do that with a queue system (e.g. RabbitMQ, Kafka, etc.)
    }
    if (runningResult.length === 0 || isReadyToRun) {
      const id = randomUUID();
      await this.exportRepository.create(
        id,
        userId,
        environment,
        Status.running
      );
      try {
        if (!process.env.DISABLE_INGESTER) {
          if (environment === Environment.preproduction) {
            await runWorkerIngesterPreproduction();
          } else {
            await runWorkerIngesterProduction();
          }
        }
        if (!process.env.DISABLE_SITEMAP) {
          await this.sitemapService.uploadSitemap();
        }
        if (!process.env.DISABLE_COPY) {
          await this.copyContainerService.runCopy();
        }
        await this.exportRepository.updateOne(id, Status.completed, new Date());
      } catch (e: any) {
        await this.exportRepository.updateOne(
          id,
          Status.failed,
          new Date(),
          e.message
        );
      }
    } else {
      throw new Error("There is already a running job");
    }
  }

  async getAll(environment?: Environment): Promise<ExportEsStatus[]> {
    if (environment) {
      return this.exportRepository.getByEnvironments(environment);
    }
    return this.exportRepository.getAll();
  }

  async getLatest(): Promise<{
    preproduction: ExportEsStatus;
    production: ExportEsStatus;
  }> {
    const latestPreprod = await this.exportRepository.getLatestByEnv(
      Environment.preproduction
    );
    const latestProd = await this.exportRepository.getLatestByEnv(
      Environment.production
    );
    return {
      preproduction: latestPreprod,
      production: latestProd,
    };
  }

  private async getRunningExport(): Promise<ExportEsStatus[]> {
    return this.exportRepository.getByStatus(Status.running);
  }

  private async cleanPreviousExport(
    runningResult: ExportEsStatus,
    hour = 1 // job created 1 hour ago
  ): Promise<boolean> {
    if (
      new Date(runningResult.created_at).getTime() <
      new Date(Date.now() - 1000 * 60 * 60 * hour).getTime()
    ) {
      await this.exportRepository.updateOne(
        runningResult.id,
        Status.timeout,
        new Date()
      );
      return true;
    }
    return false;
  }
}
