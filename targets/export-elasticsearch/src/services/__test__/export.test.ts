import { Environment, Status } from "@socialgouv/cdtn-types";
import timekeeper from "timekeeper";

import { ExportRepository } from "../../repositories";
import { rootContainer } from "../../server";
import { getName } from "../../utils";
import { runWorkerIngesterPreproduction } from "../../workers";
import { CopyContainerService } from "../copy";
import { ExportService } from "../export";
import { SitemapService } from "../sitemap";
import { FakeCopyService } from "./fake/copy";
import { FakeExportRepository } from "./fake/export";
import { FakeSitemapService } from "./fake/sitemap";
import { FakeAgreementsService } from "./fake/agreements";
import { AgreementsService } from "../agreements";

jest.mock("../../workers", () => {
  return {
    runWorkerIngesterPreproduction: jest.fn(async () => {
      return new Promise<void>((resolve) => {
        resolve();
      });
    }),
  };
});

describe("ExportService", () => {
  let service: ExportService;
  let mockRepository: FakeExportRepository;

  beforeEach(() => {
    const container = rootContainer.createChild();
    container
      .bind<FakeExportRepository>(getName(ExportRepository))
      .to(FakeExportRepository)
      .inSingletonScope();
    container
      .bind<FakeCopyService>(getName(CopyContainerService))
      .to(FakeCopyService)
      .inSingletonScope();
    container
      .bind<FakeSitemapService>(getName(SitemapService))
      .to(FakeSitemapService)
      .inSingletonScope();
    container
      .bind<FakeAgreementsService>(getName(AgreementsService))
      .to(FakeAgreementsService)
      .inSingletonScope();
    service = container.get<ExportService>(getName(ExportService));
    mockRepository = container.get<ExportRepository>(getName(ExportRepository));
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    beforeAll(() => {
      // Lock Time
      timekeeper.freeze(new Date());
    });

    afterAll(() => {
      // Unlock Time
      timekeeper.reset();
    });
    it("should return all users", async () => {
      const res = await service.getAll();
      expect(res).toEqual([
        {
          created_at: new Date(),
          environment: Environment.preproduction,
          id: "1",
          status: Status.completed,
          updated_at: new Date(),
          user_id: "getAll-id",
        },
      ]);
    });

    it("should return all users by environments", async () => {
      const env = Environment.production;
      const res = await service.getAll(env);
      expect(res).toEqual([
        {
          created_at: new Date(),
          environment: env,
          id: "1",
          status: Status.completed,
          updated_at: new Date(),
          user_id: "getByEnv-id",
        },
      ]);
    });
  });

  describe("runExport", () => {
    describe("Job is already running", () => {
      it("should not call ingester", async () => {
        await service
          .runExport("ABC", Environment.preproduction)
          .catch((e: Error) => {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(e.message).toBe(
              "Il y a déjà un export en cours qui a été lancé il y a moins de 15 minutes..."
            );
          });
      });
    });

    describe("Outdated job has run", () => {
      it("should update the job at the end of the job", async () => {
        jest.spyOn(mockRepository, "getByStatus").mockReturnValue(
          Promise.resolve([
            {
              created_at: new Date("2020-01-01"),
              environment: Environment.preproduction,
              id: "1",
              status: Status.running,
              updated_at: new Date("2020-01-01"),
              user_id: "getByStatus-id",
            },
          ])
        );
        const spy = jest.spyOn(mockRepository, "updateOne");
        await service.runExport("ABC", Environment.preproduction);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(runWorkerIngesterPreproduction).toHaveBeenCalledTimes(1);
      });

      it("should clean previous job because launched > 15min", async () => {
        const oldDate = new Date();
        const expiryDate = new Date(
          new Date().setHours(new Date().getMinutes() + 20)
        );
        timekeeper.travel(expiryDate);
        const spy = jest.spyOn(mockRepository, "updateOne");
        await service.verifyAndCleanPreviousExport(
          [
            {
              created_at: oldDate,
              environment: Environment.preproduction,
              id: "1",
              status: Status.running,
              updated_at: oldDate,
              user_id: "userId",
            },
          ],
          Environment.preproduction,
          15
        );
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it("should cancel because there are already an export in an other env", async () => {
        const spy = jest.spyOn(mockRepository, "updateOne");
        await service
          .verifyAndCleanPreviousExport(
            [
              {
                created_at: new Date("2020-01-01"),
                environment: Environment.preproduction,
                id: "1",
                status: Status.running,
                updated_at: new Date("2020-01-01"),
                user_id: "userId",
              },
            ],
            Environment.production,
            15
          )
          .catch((e: Error) => {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(e.message).toBe(
              "Il y a déjà un export en cours sur un autre environnement..."
            );
          });

        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });
});
