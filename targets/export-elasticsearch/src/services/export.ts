import type { ExportEsStatus } from "@shared/types";
import { Environment, Status } from "@shared/types";
import { randomUUID } from "crypto";
import { inject, injectable } from "inversify";

import { ExportRepository } from "../repositories";
import { getName, name } from "../utils";
import { runWorkerIngester } from "../workers";

@injectable()
@name("ExportService")
export class ExportService {
  constructor(
    @inject(getName(ExportRepository))
    private readonly exportRepository: ExportRepository
  ) {}

  async runExport(
    userId: string,
    environment: Environment
  ): Promise<ExportEsStatus> {
    let isReadyToRun = false;
    const runningResult = await this.getRunningJob();
    if (runningResult.length > 0) {
      isReadyToRun = await this.cleanOldRunningJob(runningResult[0]); // we can avoid to do that with a queue system (e.g. RabbitMQ, Kafka, etc.)
    }
    if (runningResult.length === 0 || isReadyToRun) {
      const id = randomUUID();
      const createdResult = await this.exportRepository.create(
        id,
        userId,
        environment,
        Status.running
      );
      runWorkerIngester()
        .then(async (res: string) => {
          console.log(res);
          await this.exportRepository.updateOne(
            id,
            Status.completed,
            new Date()
          );
        })
        .catch(async (error: string) => {
          console.error(error);
          await this.exportRepository.updateOne(id, Status.failed, new Date());
        });
      return createdResult;
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

  private async getRunningJob(): Promise<ExportEsStatus[]> {
    return this.exportRepository.getByStatus(Status.running);
  }

  private async cleanOldRunningJob(
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
