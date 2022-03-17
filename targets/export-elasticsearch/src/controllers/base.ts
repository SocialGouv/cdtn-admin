import { inject } from "inversify";
import type { interfaces } from "inversify-express-utils";
import { controller, httpGet } from "inversify-express-utils";

import { BaseService } from "../services/base";
import { getName } from "../utils";

@controller("/")
export class BaseController implements interfaces.Controller {
  constructor(
    @inject(getName(BaseService))
    private readonly service: BaseService
  ) {}

  @httpGet("/")
  index(): Record<string, string> {
    return this.service.get();
  }
}
