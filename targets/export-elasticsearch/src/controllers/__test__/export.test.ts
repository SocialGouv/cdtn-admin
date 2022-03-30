import "../export";

import bodyParser from "body-parser";
import type { NextFunction, Request, Response } from "express";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import request from "supertest";

import { ExportService } from "../../services";
import { Environment, Status } from "../../types";
import { getName } from "../../utils";
import { ExportEsRunMiddleware } from "../middlewares";
import { FakeExportService } from "./fake/export";

describe("ExportController /export", () => {
  let server: InversifyExpressServer;

  beforeEach(() => {
    const container = new Container();
    container
      .bind<FakeExportService>(getName(ExportService))
      .to(FakeExportService)
      .inSingletonScope();
    container
      .bind<ExportEsRunMiddleware>(getName(ExportEsRunMiddleware))
      .to(ExportEsRunMiddleware)
      .inSingletonScope();
    server = new InversifyExpressServer(container);
    server.setConfig((srv) => {
      // add body parser
      srv.use(
        bodyParser.urlencoded({
          extended: true,
        })
      );
      srv.use(bodyParser.json());
    });
    server.setErrorConfig((app) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      app.use(
        (err: Error, _req: Request, res: Response, _next: NextFunction) => {
          res.status(500).json({ error: err.message });
        }
      );
    });
  });

  describe("GET /", () => {
    it("should get a list of all status", async () => {
      const res = await request(server.build()).get("/export");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([
        {
          created_at: "2022-03-24T10:09:11.000Z",
          environment: Environment.preproduction,
          id: "1",
          status: Status.running,
          updated_at: "2022-03-24T10:09:11.000Z",
          user_id: "userId-all",
        },
      ]);
    });

    it("should get a list of status by environment", async () => {
      const res = await request(server.build()).get(
        `/export?environment=${Environment.production}`
      );
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([
        {
          created_at: "2022-03-24T10:09:11.000Z",
          environment: Environment.production,
          id: "1",
          status: Status.running,
          updated_at: "2022-03-24T10:09:11.000Z",
          user_id: "userId-env",
        },
      ]);
    });
  });

  describe("POST /", () => {
    it("should send the status running when then server is running", async () => {
      const res = await request(server.build()).post("/export").send({
        environment: Environment.production,
        userId: "890ca91b-f150-4957-9bb2-8500940815f0",
      });
      expect(res.statusCode).toEqual(202);
      expect(res.body).toEqual({
        created_at: "2022-03-24T10:09:11.000Z",
        environment: Environment.production,
        id: "1",
        status: Status.running,
        updated_at: "2022-03-24T10:09:11.000Z",
        user_id: "890ca91b-f150-4957-9bb2-8500940815f0",
      });
    });

    it("should send an error due to middleware because missing variables", async () => {
      const res = await request(server.build()).post("/export").send({
        userId: "890ca91b-f150-4957-9bb2-8500940815f0",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          errors: [
            {
              code: "invalid_enum_value",
              message:
                "Invalid enum value. Expected 'production' | 'preproduction'",
              options: ["production", "preproduction"],
              path: ["environment"],
            },
          ],
        })
      );
    });

    it("should send an error due to middleware because userId is not uuid", async () => {
      const res = await request(server.build()).post("/export").send({
        environment: Environment.preproduction,
        userId: "yo-f150-4957-9bb2-yo",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          errors: [
            {
              code: "invalid_string",
              message: "Invalid uuid",
              path: ["userId"],
              validation: "uuid",
            },
          ],
        })
      );
    });

    it("should send an error due to middleware because environment is not inside the enum", async () => {
      const res = await request(server.build()).post("/export").send({
        environment: "pproductionnn",
        userId: "890ca91b-f150-4957-9bb2-8500940815f0",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          errors: [
            {
              code: "invalid_enum_value",
              message:
                "Invalid enum value. Expected 'production' | 'preproduction'",
              options: ["production", "preproduction"],
              path: ["environment"],
            },
          ],
        })
      );
    });
  });
});
