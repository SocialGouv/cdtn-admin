import type { ExportEsStatus } from "@socialgouv/cdtn-types";
import { Environment, Status } from "@socialgouv/cdtn-types";
import { logger } from "@shared/utils";
import { randomUUID } from "crypto";
import { inject, injectable } from "inversify";

import { ExportRepository } from "../repositories";
import { getName, name, sendMattermostMessage } from "../utils";
import {
  runWorkerIngesterPreproduction,
  runWorkerIngesterProduction,
} from "../workers";
import { CopyContainerService } from "./copy";
import { SitemapService } from "./sitemap";
import { AgreementsService } from "./agreements";

@injectable()
@name("ExportService")
export class ExportService {
  constructor(
    @inject(getName(ExportRepository))
    private readonly exportRepository: ExportRepository,
    @inject(getName(SitemapService))
    private readonly sitemapService: SitemapService,
    @inject(getName(CopyContainerService))
    private readonly copyContainerService: CopyContainerService,
    @inject(getName(AgreementsService))
    private readonly exportAgreementsService: AgreementsService
  ) {}

  async runExport(
    userId: string,
    environment: Environment
  ): Promise<ExportEsStatus> {
    logger.info(`[${userId}] run export for ${environment}`);
    const id = randomUUID();
    const exportEs = await this.exportRepository.create(
      id,
      userId,
      environment,
      Status.running
    );
    const envName =
      environment === Environment.preproduction
        ? "Préproduction"
        : "Production";
    try {
      if (!process.env.DISABLE_INGESTER) {
        const startMessage = `**${envName}:** mise à jour lancée par *${exportEs.user?.name}* 🚀`;
        await sendMattermostMessage(
          startMessage,
          process.env.MATTERMOST_CHANNEL_EXPORT
        );
        logger.info(startMessage);
        if (environment === Environment.preproduction) {
          await runWorkerIngesterPreproduction();
        } else {
          await runWorkerIngesterProduction();
        }
      }
      if (!process.env.DISABLE_SITEMAP) {
        await this.sitemapService.uploadSitemap(environment);
      }
      if (!process.env.DISABLE_AGREEMENTS) {
        await this.exportAgreementsService.uploadAgreements(environment);
      }
      if (!process.env.DISABLE_COPY) {
        await this.copyContainerService.runCopy(environment);
      }
      const exportEsDone = await this.exportRepository.getOne(id);

      const message = `**${envName}:** mise à jour terminée (${exportEsDone.documentsCount?.total} documents) 🎉`;
      logger.info(message);
      await sendMattermostMessage(
        message,
        process.env.MATTERMOST_CHANNEL_EXPORT
      );

      return await this.exportRepository.updateOne(
        id,
        Status.completed,
        new Date()
      );
    } catch (e: any) {
      await sendMattermostMessage(
        `⚠️ **${envName}:** La mise à jour a échouée. ⚠️`,
        process.env.MATTERMOST_CHANNEL_EXPORT
      );
      return await this.exportRepository.updateOne(
        id,
        Status.failed,
        new Date(),
        e.message
      );
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

  async getRunningExport(): Promise<ExportEsStatus[]> {
    return this.exportRepository.getByStatus(Status.running);
  }

  async verifyAndCleanPreviousExport(
    runningResult: ExportEsStatus[],
    environment: Environment,
    minutes: number
  ): Promise<void> {
    if (runningResult.length > 0) {
      if (runningResult[0].environment !== environment) {
        throw new Error(
          "Il y a déjà un export en cours sur un autre environnement..."
        );
      }
      if (
        new Date(runningResult[0].created_at).getTime() <
        new Date(Date.now() - 1000 * 60 * minutes).getTime()
      ) {
        await this.exportRepository.updateOne(
          runningResult[0].id,
          Status.timeout,
          new Date()
        );
      } else {
        throw new Error(
          `Il y a déjà un export en cours qui a été lancé il y a moins de ${minutes} minutes...`
        );
      }
    }
  }
}
