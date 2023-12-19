import type { ExportEsStatus } from "@shared/types";
import { Environment, Status } from "@shared/types";
import { injectable } from "inversify";

import { wait } from "../../../utils";

@injectable()
export class FakeExportRepository {
  // Rename stub
  async create(
    id: string,
    userId: string,
    environment: Environment,
    status: Status
  ): Promise<ExportEsStatus> {
    await wait(100);
    return {
      created_at: new Date(),
      environment,
      id,
      status,
      updated_at: new Date(),
      user_id: userId,
    };
  }

  async updateOne(
    id: string,
    status: Status,
    updatedAt: Date
  ): Promise<ExportEsStatus> {
    await wait(100);
    return {
      created_at: new Date(),
      environment: Environment.preproduction,
      id,
      status,
      updated_at: updatedAt,
      user_id: "updated-id",
      error: "error",
    };
  }

  async getByEnvironments(environment: Environment): Promise<ExportEsStatus[]> {
    await wait(100);
    return [
      {
        created_at: new Date(),
        environment,
        id: "1",
        status: Status.completed,
        updated_at: new Date(),
        user_id: "getByEnv-id",
      },
    ];
  }

  public async getLatestByEnv(
    environment: Environment
  ): Promise<ExportEsStatus> {
    await wait(100);
    return {
      created_at: new Date(),
      environment,
      id: "1",
      status: Status.completed,
      updated_at: new Date(),
      user_id: "getLatestByEnv-id",
    };
  }

  async getAll(): Promise<ExportEsStatus[]> {
    await wait(100);
    return [
      {
        created_at: new Date(),
        environment: Environment.preproduction,
        id: "1",
        status: Status.completed,
        updated_at: new Date(),
        user_id: "getAll-id",
      },
    ];
  }

  async getByStatus(status: Status): Promise<ExportEsStatus[]> {
    await wait(100);
    return [
      {
        created_at: new Date(),
        environment: Environment.preproduction,
        id: "1",
        status,
        updated_at: new Date(),
        user_id: "getByStatus-id",
      },
    ];
  }
}
