import "reflect-metadata";
import "./controllers";

import bodyParser from "body-parser";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";

import { ExportService } from "./services";
import { getName } from "./utils";

// set up container
const container = new Container();
container.bind<ExportService>(getName(ExportService)).to(ExportService);

// create server
const server = new InversifyExpressServer(container);
server.setConfig((srv) => {
  // add body parser
  srv.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  srv.use(bodyParser.json());
});

const app = server.build();

export default app;
