import "reflect-metadata";
import "./controllers";

import bodyParser from "body-parser";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";

import { BaseService, IngesterService } from "./services";
import { getName } from "./utils";

// set up container
const container = new Container();

container.bind<BaseService>(getName(BaseService)).to(BaseService);

container.bind<IngesterService>(getName(IngesterService)).to(IngesterService);
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

export const app = server.build();
app.listen(process.env.PORT ?? 3000);
