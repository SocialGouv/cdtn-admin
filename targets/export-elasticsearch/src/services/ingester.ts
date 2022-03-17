import { injest } from "@shared/elasticsearch-document-adapter";
import { injectable } from "inversify";

import { Status } from "../types";
import { name } from "../utils";

@injectable()
@name("IngesterService")
export class IngesterService {
  runIngester(): Record<string, string> {
    injest()
      .then(() => {
        console.log("Ingester completed successfully");
      })
      .catch((error: unknown) => {
        console.error(error);
      });
    return {
      status: Status.running,
    };
  }
}
