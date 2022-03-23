import { client } from "@shared/graphql-client";
import { injectable } from "inversify";

import type { Environment, ExportEsStatus, Status } from "../types";
import { name } from "../utils";
import {
  createExportEsStatus,
  getAllExport,
  getExportEsStatusByEnvironments,
  getExportEsStatusById,
  getExportEsStatusByStatus,
  updateExportEsStatus,
  updateOneExportEsStatus,
} from "./graphql";

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
      .mutation<{ insert_export_es_status_one: ExportEsStatus }>(
        createExportEsStatus,
        {
          environment,
          id,
          status,
          user_id: userId,
        }
      )
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data?.insert_export_es_status_one;
  }

  public async updateOne(
    id: string,
    status: Status,
    updatedAt: Date
  ): Promise<ExportEsStatus | undefined> {
    const res = await client
      .mutation<{ update_export_es_status_by_pk: ExportEsStatus }>(
        updateOneExportEsStatus,
        {
          id,
          status,
          updated_at: updatedAt,
        }
      )
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data?.update_export_es_status_by_pk;
  }

  public async updateAll(
    oldStatus: Status,
    newStatus: Status,
    updatedAt: Date
  ): Promise<ExportEsStatus | undefined> {
    const res = await client
      .mutation<{ update_export_es_status_by_pk: ExportEsStatus }>(
        updateExportEsStatus,
        {
          new_status: newStatus,
          old_status: oldStatus,
          updated_at: updatedAt,
        }
      )
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data?.update_export_es_status_by_pk;
  }

  public async getOneById(id: string): Promise<ExportEsStatus | undefined> {
    const res = await client
      .query<{ export_es_status_by_pk: ExportEsStatus }>(
        getExportEsStatusById,
        { id }
      )
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data?.export_es_status_by_pk;
  }

  public async getByEnvironments(
    environment: Environment
  ): Promise<ExportEsStatus[] | undefined> {
    const res = await client
      .query<{ export_es_status: ExportEsStatus[] }>(
        getExportEsStatusByEnvironments,
        { environment }
      )
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data?.export_es_status;
  }

  public async getAll(): Promise<ExportEsStatus[] | undefined> {
    const res = await client
      .query<{ export_es_status: ExportEsStatus[] }>(getAllExport)
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data?.export_es_status;
  }

  public async getByStatus(
    status: Status
  ): Promise<ExportEsStatus[] | undefined> {
    const res = await client
      .query<{ export_es_status: ExportEsStatus[] }>(
        getExportEsStatusByStatus,
        { status }
      )
      .toPromise();
    if (res.error) {
      return undefined;
    }
    return res.data?.export_es_status;
  }
}
