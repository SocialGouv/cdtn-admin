import "reflect-metadata";
import "./controllers";

import bodyParser from "body-parser";
import type { NextFunction, Request, Response } from "express";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";

import { ExportEsRunMiddleware } from "./controllers/middlewares";
import { ExportRepository } from "./repositories";
import { ExportService } from "./services";
import { getName } from "./utils";

// set up container
export const rootContainer = new Container();
rootContainer.bind<ExportService>(getName(ExportService)).to(ExportService);
rootContainer
  .bind<ExportRepository>(getName(ExportRepository))
  .to(ExportRepository);
rootContainer
  .bind<ExportEsRunMiddleware>(getName(ExportEsRunMiddleware))
  .to(ExportEsRunMiddleware);

// create server
const server = new InversifyExpressServer(rootContainer);
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
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ error: err });
  });
});

export const app = server.build();
