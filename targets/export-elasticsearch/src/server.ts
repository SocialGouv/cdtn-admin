import "reflect-metadata";
import "./controllers";

import bodyParser from "body-parser";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";

import {
  ExportEsRunMiddleware,
  ValidatorChatMiddleware,
} from "./controllers/middlewares";
import {
  AzureParameters,
  AzureRepository,
  DocumentsRepository,
  ExportRepository,
} from "./repositories";
import {
  ChatService,
  CopyContainerService,
  EmbeddingService,
  ExportService,
  SitemapService,
} from "./services";
import { getName } from "./utils";

// set up container
export const rootContainer = new Container();
/* REPOSITORIES */
rootContainer
  .bind<AzureRepository>(getName(AzureRepository))
  .to(AzureRepository);
/* PARAMETERS OF CONTAINER */
rootContainer
  .bind<string>(AzureParameters.ACCOUNT_KEY_FROM)
  .toConstantValue(process.env.AZ_ACCOUNT_KEY_FROM ?? "");
rootContainer
  .bind<string>(AzureParameters.ACCOUNT_NAME_FROM)
  .toConstantValue(process.env.AZ_ACCOUNT_NAME_FROM ?? "");
rootContainer
  .bind<string>(AzureParameters.BUCKET_URL_FROM)
  .toConstantValue(
    process.env.AZ_URL_FROM ??
      `https://${process.env.AZ_ACCOUNT_NAME_FROM}.blob.core.windows.net`
  );
rootContainer
  .bind<string>(AzureParameters.ACCOUNT_KEY_TO)
  .toConstantValue(process.env.AZ_ACCOUNT_KEY_TO ?? "");
rootContainer
  .bind<string>(AzureParameters.ACCOUNT_NAME_TO)
  .toConstantValue(process.env.AZ_ACCOUNT_NAME_TO ?? "");
rootContainer
  .bind<string>(AzureParameters.BUCKET_URL_TO)
  .toConstantValue(
    process.env.AZ_URL_TO ??
      `https://${process.env.AZ_ACCOUNT_NAME_TO}.blob.core.windows.net`
  );

rootContainer
  .bind<ExportRepository>(getName(ExportRepository))
  .to(ExportRepository);
rootContainer
  .bind<DocumentsRepository>(getName(DocumentsRepository))
  .to(DocumentsRepository);

/* MIDDLEWARE */
rootContainer
  .bind<ExportEsRunMiddleware>(getName(ExportEsRunMiddleware))
  .to(ExportEsRunMiddleware);
rootContainer
  .bind<ValidatorChatMiddleware>(getName(ValidatorChatMiddleware))
  .to(ValidatorChatMiddleware);
/* SERVICES */
rootContainer.bind<ExportService>(getName(ExportService)).to(ExportService);
rootContainer.bind<SitemapService>(getName(SitemapService)).to(SitemapService);
rootContainer
  .bind<CopyContainerService>(getName(CopyContainerService))
  .to(CopyContainerService);
rootContainer
  .bind<EmbeddingService>(getName(EmbeddingService))
  .to(EmbeddingService);
rootContainer.bind<ChatService>(getName(ChatService)).to(ChatService);

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
  srv.use(
    cors({
      origin: ["*.fabrique.social.gouv.fr", "http://localhost:3000"],
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
