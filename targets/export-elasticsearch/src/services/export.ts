import { injest } from "@shared/elasticsearch-document-adapter";
import { inject, injectable } from "inversify";

import { ExportRepository } from "../repositories";
import type { Environment, ExportEsStatus } from "../types";
import { Status } from "../types";
import { getName, name, uuidv4 } from "../utils";

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
    const runningResult = await this.exportRepository.getOneByStatus(
      Status.running
    );
    if (runningResult) {
      isReadyToRun = await this.cleanOldRunningJob(runningResult); // we can avoid to do that with a queue system (e.g. RabbitMQ, Kafka, etc.)
    }
    if (!runningResult || isReadyToRun) {
      const id = uuidv4();
      const createdResult = await this.exportRepository.create(
        id,
        userId,
        environment,
        Status.running
      );
      if (!createdResult) {
        throw new Error("Error while creating status");
      }
      injest()
        .then(async () => {
          console.log("Export elasticsearch completed successfully");
          await this.exportRepository.updateOne(
            id,
            Status.completed,
            new Date()
          );
        })
        .catch(async (error: unknown) => {
          console.error(error);
          await this.exportRepository.updateOne(id, Status.failed, new Date());
        });
      return createdResult;
    }
    return runningResult;
  }

  async getJobByEnvironment(
    environment: Environment
  ): Promise<ExportEsStatus[] | undefined> {
    return this.exportRepository.getByEnvironments(environment);
  }

  private async cleanOldRunningJob(
    runningResult: ExportEsStatus,
    hour = 1 // job created 1 hour ago
  ): Promise<boolean> {
    if (
      new Date(runningResult.created_at).getTime() >
      new Date(Date.now() - 1000 * 60 * 60 * hour).getTime()
    ) {
      await this.exportRepository.updateOne(
        runningResult.id,
        Status.failed,
        new Date()
      );
      return true;
    }
    return false;
  }
}
