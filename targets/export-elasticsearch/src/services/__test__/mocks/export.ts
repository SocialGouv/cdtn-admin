import { injectable } from "inversify";

import type { ExportEsStatus } from "../../../types";
import { Environment, Status } from "../../../types";
import { wait } from "../../../utils";

@injectable()
export class MockExportRepository {
  async create(
    id: string,
    userId: string,
    environment: Environment,
    status: Status
  ): Promise<ExportEsStatus | undefined> {
    await wait(100);
    return {
      created_at: new Date("2022-03-24T11:09:11"),
      environment,
      id,
      status,
      updated_at: new Date("2022-03-24T11:09:11"),
      user_id: userId,
    };
  }

  async updateOne(
    id: string,
    status: Status,
    _updatedAt: Date
  ): Promise<ExportEsStatus | undefined> {
    await wait(100);
    return {
      created_at: new Date("2022-03-24T11:09:11"),
      environment: Environment.preproduction,
      id,
      status,
      updated_at: new Date("2022-03-24T11:09:11"),
      user_id: "updated-id",
    };
  }

  async updateAll(
    oldStatus: Status,
    newStatus: Status,
    updatedAt: Date
  ): Promise<ExportEsStatus[] | undefined> {
    await wait(100);
    return [
      {
        created_at: new Date("2022-03-24T11:09:11"),
        environment: Environment.preproduction,
        id: "1",
        status: newStatus,
        updated_at: new Date("2022-03-24T11:09:11"),
        user_id: "updatedAll-id",
      },
    ];
  }

  async getOneById(id: string): Promise<ExportEsStatus | undefined> {
    await wait(100);
    return {
      created_at: new Date("2022-03-24T11:09:11"),
      environment: Environment.preproduction,
      id,
      status: Status.completed,
      updated_at: new Date("2022-03-24T11:09:11"),
      user_id: "getOne-id",
    };
  }

  async getByEnvironments(
    environment: Environment
  ): Promise<ExportEsStatus[] | undefined> {
    await wait(100);
    return [
      {
        created_at: new Date("2022-03-24T11:09:11"),
        environment,
        id: "1",
        status: Status.completed,
        updated_at: new Date("2022-03-24T11:09:11"),
        user_id: "getByEnv-id",
      },
    ];
  }

  async getAll(): Promise<ExportEsStatus[] | undefined> {
    await wait(100);
    return [
      {
        created_at: new Date("2022-03-24T11:09:11"),
        environment: Environment.preproduction,
        id: "1",
        status: Status.completed,
        updated_at: new Date("2022-03-24T11:09:11"),
        user_id: "getAll-id",
      },
    ];
  }

  async getByStatus(status: Status): Promise<ExportEsStatus[] | undefined> {
    await wait(100);
    return [
      {
        created_at: new Date("2022-03-24T11:09:11"),
        environment: Environment.preproduction,
        id: "1",
        status,
        updated_at: new Date("2022-03-24T11:09:11"),
        user_id: "getAll-id",
      },
    ];
  }
}
