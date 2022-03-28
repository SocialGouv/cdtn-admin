import { injectable } from "inversify";

import type { ExportEsStatus } from "../../../types";
import { Environment, Status } from "../../../types";
import { wait } from "../../../utils";

@injectable()
export class FakeExportService {
  async runExport(
    userId: string,
    environment: Environment
  ): Promise<ExportEsStatus> {
    await wait(100);
    return {
      created_at: new Date("2022-03-24T11:09:11"),
      environment,
      id: "1",
      status: Status.running,
      updated_at: new Date("2022-03-24T11:09:11"),
      user_id: userId,
    };
  }

  async getAll(
    environment?: Environment
  ): Promise<ExportEsStatus[] | undefined> {
    await wait(100);
    if (environment) {
      return [
        {
          created_at: new Date("2022-03-24T11:09:11"),
          environment,
          id: "1",
          status: Status.running,
          updated_at: new Date("2022-03-24T11:09:11"),
          user_id: "userId-env",
        },
      ];
    }
    return [
      {
        created_at: new Date("2022-03-24T11:09:11"),
        environment: Environment.preproduction,
        id: "1",
        status: Status.running,
        updated_at: new Date("2022-03-24T11:09:11"),
        user_id: "userId-all",
      },
    ];
  }
}
