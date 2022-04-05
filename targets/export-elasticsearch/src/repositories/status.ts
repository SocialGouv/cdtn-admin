import { client } from "@shared/graphql-client";
import type { Environment, ExportEsStatus, Status } from "@shared/types";
import { injectable } from "inversify";

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
  ): Promise<ExportEsStatus> {
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
      throw res.error;
    }
    if (!res.data?.insert_export_es_status_one) {
      throw new Error("Failed to create export, undefined object");
    }
    return res.data.insert_export_es_status_one;
  }

  public async updateOne(
    id: string,
    status: Status,
    updatedAt: Date
  ): Promise<ExportEsStatus> {
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
      throw res.error;
    }
    if (!res.data?.update_export_es_status_by_pk) {
      throw new Error("Failed to update, undefined object");
    }
    return res.data.update_export_es_status_by_pk;
  }

  public async updateAll(
    oldStatus: Status,
    newStatus: Status,
    updatedAt: Date
  ): Promise<ExportEsStatus[]> {
    const res = await client
      .mutation<{ update_export_es_status_by_pk: ExportEsStatus[] }>(
        updateExportEsStatus,
        {
          new_status: newStatus,
          old_status: oldStatus,
          updated_at: updatedAt,
        }
      )
      .toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data?.update_export_es_status_by_pk) {
      throw new Error("Failed to update, undefined object");
    }
    return res.data.update_export_es_status_by_pk;
  }

  public async getOneById(id: string): Promise<ExportEsStatus> {
    const res = await client
      .query<{ export_es_status_by_pk: ExportEsStatus }>(
        getExportEsStatusById,
        { id }
      )
      .toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data?.export_es_status_by_pk) {
      throw new Error("Failed to get, undefined object");
    }
    return res.data.export_es_status_by_pk;
  }

  public async getByEnvironments(
    environment: Environment
  ): Promise<ExportEsStatus[]> {
    const res = await client
      .query<{ export_es_status: ExportEsStatus[] }>(
        getExportEsStatusByEnvironments,
        { environment }
      )
      .toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data?.export_es_status) {
      throw new Error("Failed to get, undefined object");
    }
    return res.data.export_es_status;
  }

  public async getAll(): Promise<ExportEsStatus[]> {
    const res = await client
      .query<{ export_es_status: ExportEsStatus[] }>(getAllExport)
      .toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data?.export_es_status) {
      throw new Error("Failed to get, undefined object");
    }
    return res.data.export_es_status;
  }

  public async getByStatus(status: Status): Promise<ExportEsStatus[]> {
    const res = await client
      .query<{ export_es_status: ExportEsStatus[] }>(
        getExportEsStatusByStatus,
        { status }
      )
      .toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data?.export_es_status) {
      throw new Error("Failed to get, undefined object");
    }
    return res.data.export_es_status;
  }
}
