import timekeeper from "timekeeper";

import { ExportRepository } from "../../repositories";
import { rootContainer } from "../../server";
import { Environment, Status } from "../../types";
import { getName } from "../../utils";
import { ExportService } from "../export";
import { MockExportRepository } from "./mocks/export";

jest.mock("@shared/elasticsearch-document-adapter", () => {
  return {
    injest: async () => {
      return new Promise<void>((resolve, _reject) => {
        resolve();
      });
    },
  };
});

const currentDate = new Date();

describe("ExportService", () => {
  let service: ExportService;
  let mockRepository: MockExportRepository;

  beforeEach(() => {
    const container = rootContainer.createChild();
    container
      .bind<ExportRepository>(getName(ExportRepository))
      .to(MockExportRepository)
      .inSingletonScope();
    service = container.get<ExportService>(getName(ExportService));
    mockRepository = container.get<ExportRepository>(getName(ExportRepository));
  });

  describe("getAll", () => {
    it("should return all users", async () => {
      const res = await service.getAll();
      expect(res).toEqual([
        {
          created_at: new Date("2022-03-24T11:09:11"),
          environment: Environment.preproduction,
          id: "1",
          status: Status.completed,
          updated_at: new Date("2022-03-24T11:09:11"),
          user_id: "getAll-id",
        },
      ]);
    });

    it("should return all users by environments", async () => {
      const env = Environment.production;
      const res = await service.getAll(env);
      expect(res).toEqual([
        {
          created_at: new Date("2022-03-24T11:09:11"),
          environment: env,
          id: "1",
          status: Status.completed,
          updated_at: new Date("2022-03-24T11:09:11"),
          user_id: "getByEnv-id",
        },
      ]);
    });
  });

  describe("runExport", () => {
    beforeAll(() => {
      // Lock Time
      timekeeper.freeze(currentDate);
    });

    afterAll(() => {
      // Unlock Time
      timekeeper.reset();
    });
    it("should return a running status", async () => {
      const res = await service.runExport("ABC", Environment.preproduction);
      expect(res).toMatchObject({
        created_at: new Date("2022-03-24T10:09:11.000Z"),
        environment: Environment.preproduction,
        status: Status.running,
        updated_at: new Date("2022-03-24T10:09:11.000Z"),
        user_id: "ABC",
      });
    });

    it("should create a new status", async () => {
      const spy = jest.spyOn(mockRepository, "create");
      await service.runExport("ABC", Environment.preproduction);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should get running job", async () => {
      const spy = jest.spyOn(mockRepository, "getByStatus");
      await service.runExport("ABC", Environment.preproduction);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should update the job at the end of ingester", async () => {
      const spy = jest.spyOn(mockRepository, "updateOne");
      await service.runExport("ABC", Environment.preproduction);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    // it("should update this new status as completed", async () => {
    //   const spy = jest.spyOn(mockRepository, "updateOne");
    //   await service.runExport("ABC", Environment.preproduction);
    //   expect(spy).toHaveBeenCalledWith("1", Status.completed, currentDate);
    // });

    // it("should update this new status as failed", async () => {
    //   const spy = jest.spyOn(mockRepository, "updateOne");
    //   await service.runExport("ABC", Environment.preproduction);
    //   expect(spy).toHaveBeenCalledWith("1", Status.failed, currentDate);
    // });

    // it("should failed because a job is running since < 1 hour", async () => {
    //   const spy = jest.spyOn(mockRepository, "updateOne");
    //   await service.runExport("ABC", Environment.preproduction);
    //   expect(spy).toHaveBeenCalledWith("1", Status.failed, currentDate);
    // });

    // it("should clean job the pending job", async () => {
    //   const spy = jest.spyOn(mockRepository, "updateOne");
    //   await service.runExport("ABC", Environment.preproduction);
    //   expect(spy).toHaveBeenCalledWith("1", Status.failed, currentDate);
    // });
  });
});
