import "reflect-metadata";
import "./controllers";

import bodyParser from "body-parser";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";

import {
  ExportEsRunMiddleware,
  GlossaryMiddleware,
} from "./controllers/middlewares";
import { ExportRepository, S3Parameters, S3Repository } from "./repositories";
import {
  CopyContainerService,
  ExportService,
  SitemapService,
} from "./services";
import { getName } from "./utils";
import { AgreementsService } from "./services/agreements";
import { AgreementsRepository } from "./repositories/agreements";
import { GlossaryService } from "./services/glossary";
import { GlossaryRepository } from "./repositories/glossary";

// set up container
export const rootContainer = new Container();
/* PARAMETERS OF CONTAINER */
rootContainer
  .bind<string>(S3Parameters.BUCKET_ACCESS_KEY)
  .toConstantValue(process.env.BUCKET_ACCESS_KEY ?? "");
rootContainer
  .bind<string>(S3Parameters.BUCKET_ENDPOINT)
  .toConstantValue(process.env.BUCKET_ENDPOINT ?? "");
rootContainer
  .bind<string>(S3Parameters.BUCKET_NAME)
  .toConstantValue(process.env.BUCKET_NAME ?? "");
rootContainer
  .bind<string>(S3Parameters.BUCKET_REGION)
  .toConstantValue(process.env.BUCKET_REGION ?? "us-east-1");
rootContainer
  .bind<string>(S3Parameters.BUCKET_SECRET_KEY)
  .toConstantValue(process.env.BUCKET_SECRET_KEY ?? "");
rootContainer
  .bind<string>(S3Parameters.BUCKET_DRAFT_FOLDER)
  .toConstantValue(process.env.NEXT_PUBLIC_BUCKET_DRAFT_FOLDER ?? `draft`);
rootContainer
  .bind<string>(S3Parameters.BUCKET_PUBLISHED_FOLDER)
  .toConstantValue(process.env.BUCKET_PUBLISHED_FOLDER ?? `published`);
rootContainer
  .bind<string>(S3Parameters.BUCKET_PREVIEW_FOLDER)
  .toConstantValue(process.env.BUCKET_PREVIEW_FOLDER ?? `preview`);
rootContainer
  .bind<string>(S3Parameters.BUCKET_DEFAULT_FOLDER)
  .toConstantValue(process.env.NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER ?? `default`);
/* REPOSITORIES */
rootContainer.bind<S3Repository>(getName(S3Repository)).to(S3Repository);
rootContainer
  .bind<ExportRepository>(getName(ExportRepository))
  .to(ExportRepository);
rootContainer
  .bind<AgreementsRepository>(getName(AgreementsRepository))
  .to(AgreementsRepository);
rootContainer
  .bind<GlossaryRepository>(getName(GlossaryRepository))
  .to(GlossaryRepository);
/* MIDDLEWARE */
rootContainer
  .bind<ExportEsRunMiddleware>(getName(ExportEsRunMiddleware))
  .to(ExportEsRunMiddleware);
rootContainer
  .bind<GlossaryMiddleware>(getName(GlossaryMiddleware))
  .to(GlossaryMiddleware);
/* SERVICES */
rootContainer.bind<ExportService>(getName(ExportService)).to(ExportService);
rootContainer.bind<SitemapService>(getName(SitemapService)).to(SitemapService);
rootContainer
  .bind<AgreementsService>(getName(AgreementsService))
  .to(AgreementsService);
rootContainer
  .bind<CopyContainerService>(getName(CopyContainerService))
  .to(CopyContainerService);
rootContainer
  .bind<GlossaryService>(getName(GlossaryService))
  .to(GlossaryService);

// create server
const server = new InversifyExpressServer(rootContainer);
server.setConfig((srv) => {
  // Increase limit for glossary
  srv.use(express.json({ limit: "5mb" }));

  // add body parser
  srv.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  srv.use(bodyParser.json());
  srv.use(
    cors({
      origin: ["*.fabrique.social.gouv.fr", "http://localhost:3001"],
    })
  );
});
server.setErrorConfig((srv) => {
  srv.use(
    (
      err: Record<string, string>,
      _req: Request,
      res: Response,
      _next: NextFunction
    ) => {
      res.status(500).json({ errors: err.message || err });
    }
  );
});

export const app = server.build();
