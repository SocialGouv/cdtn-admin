import "reflect-metadata";
import "./controllers";

import bodyParser from "body-parser";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";

import * as Services from "./services";
import { getName } from "./utils";

// set up container
const container = new Container();

for (const service of Object.keys(Services)) {
  container
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    .bind<typeof Services[service]>(getName(Services[service]))
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .to(Services[service]);
}

// create server
const server = new InversifyExpressServer(container);
server.setConfig((app) => {
  // add body parser
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(bodyParser.json());
});

const app = server.build();
app.listen(process.env.PORT ?? 3000);
