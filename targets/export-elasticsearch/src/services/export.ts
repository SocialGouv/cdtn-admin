import { injest } from "@shared/elasticsearch-document-adapter";
import { injectable } from "inversify";

import { Status } from "../types";
import { name } from "../utils";

@injectable()
@name("ExportService")
export class ExportService {
  runExport(): { status: Status } {
    // injest()
    //   .then(() => {
    //     console.log("Export elasticsearch completed successfully");
    //   })
    //   .catch((error: unknown) => {
    //     console.error(error);
    //   });
    return { status: Status.running };
  }
}
