import { client } from "@shared/graphql-client";
import { injectable } from "inversify";

import {
  createExportEsStatus,
  getExportEsStatusByEnvironments,
  getExportEsStatusById,
  getExportEsStatusByStatus,
  updateExportEsStatus,
} from "../graphql";
import type { Environment, ExportEsStatus, Status } from "../types";
import { name } from "../utils";

@injectable()
@name("ExportRepository")
export class ExportRepository {
  public async create(
    id: string,
    userId: string,
    environment: Environment,
    status: Status
  ): Promise<ExportEsStatus | undefined> {
    const res = await client
      .mutation<ExportEsStatus>(createExportEsStatus, {
        environment,
        id,
        status,
        user_id: userId,
      })
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data;
  }

  public async updateOne(
    id: string,
    status: Status,
    updatedAt: Date
  ): Promise<ExportEsStatus | undefined> {
    const res = await client
      .mutation<ExportEsStatus>(updateExportEsStatus, {
        id,
        status,
        updated_at: updatedAt,
      })
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data;
  }

  public async getOneById(id: string): Promise<ExportEsStatus | undefined> {
    const res = await client
      .query<ExportEsStatus>(getExportEsStatusById, { id })
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data;
  }

  public async getByEnvironments(
    environment: Environment
  ): Promise<ExportEsStatus[] | undefined> {
    const res = await client
      .query<ExportEsStatus[]>(getExportEsStatusByEnvironments, { environment })
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data;
  }

  public async getOneByStatus(
    status: Status
  ): Promise<ExportEsStatus | undefined> {
    const res = await client
      .query<ExportEsStatus[]>(getExportEsStatusByStatus, { status })
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data ? res.data[0] : undefined;
  }
}
