import { inject } from "inversify";
import type { interfaces } from "inversify-express-utils";
import { controller, httpGet } from "inversify-express-utils";

import { IngesterService } from "../services/ingester";
import { getName } from "../utils";

@controller("/ingester")
export class IngesterController implements interfaces.Controller {
  constructor(
    @inject(getName(IngesterService))
    private readonly service: IngesterService
  ) {}

  @httpGet("/run")
  run(): Record<string, unknown> {
    return this.service.runIngester();
  }
}
