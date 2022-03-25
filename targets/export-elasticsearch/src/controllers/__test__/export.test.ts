import "../export";

import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import request from "supertest";

import { ExportService } from "../../services";
import { Status } from "../../types";
import { getName } from "../../utils";
import { MockExportService } from "./mocks/export";

describe("ExportController /export", () => {
  let server: InversifyExpressServer;

  beforeEach(() => {
    const container = new Container();
    container
      .bind<MockExportService>(getName(ExportService))
      .to(MockExportService);
    server = new InversifyExpressServer(container);
  });

  // describe("POST /", () => {
  //   it("should send the status running when then server is running", async () => {
  //     const res = await request(server.build()).post("/export/run");
  //     expect(res.statusCode).toEqual(202);
  //     expect(res.body).toEqual({ status: Status.running });
  //   });

  //   it("should send an error due to middleware because missing variables", async () => {
  //     const res = await request(server.build()).post("/export/run");
  //     expect(res.statusCode).toEqual(202);
  //     expect(res.body).toEqual({ status: Status.running });
  //   });

  //   it("should send an error due to middleware because userId is not uuid", async () => {
  //     const res = await request(server.build()).post("/export/run");
  //     expect(res.statusCode).toEqual(202);
  //     expect(res.body).toEqual({ status: Status.running });
  //   });

  //   it("should send an error due to middleware because environment is not inside the enum", async () => {
  //     const res = await request(server.build()).post("/export/run");
  //     expect(res.statusCode).toEqual(202);
  //     expect(res.body).toEqual({ status: Status.running });
  //   });
  // });

  // describe("GET /", () => {
  //   it("should get a list of all status", async () => {
  //     const res = await request(server.build()).post("/export/run");
  //     expect(res.statusCode).toEqual(202);
  //     expect(res.body).toEqual({ status: Status.running });
  //   });

  //   it("should get a list of status by environment", async () => {
  //     const res = await request(server.build()).post("/export/run");
  //     expect(res.statusCode).toEqual(202);
  //     expect(res.body).toEqual({ status: Status.running });
  //   });
  // });
});
