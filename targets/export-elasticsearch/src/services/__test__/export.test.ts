// import { Status } from "../../types";
// import { ExportService } from "../export";

jest.mock("@shared/elasticsearch-document-adapter", () => {
  return {
    injest: jest.fn(async () => Promise.resolve({ data: {} })),
  };
});

describe("ExportService", () => {
  // it("should run ingester", () => {
  //   const service = new ExportService();
  //   expect(service.runExport()).toEqual({ status: Status.running });
  // });
});
