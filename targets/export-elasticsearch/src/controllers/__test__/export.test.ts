import request from "supertest";

import app from "../../server";
import { Status } from "../../types";

jest.mock("@shared/elasticsearch-document-adapter", () => {
  return {
    injest: jest.fn(async () => Promise.resolve({ data: {} })),
  };
});

describe("ExportController", () => {
  it("should send the status running when then server is running", async () => {
    const res = await request(app).post("/export/run");
    expect(res.statusCode).toEqual(202);
    expect(res.body).toEqual({ status: Status.running });
  });
});
