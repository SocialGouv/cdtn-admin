import type { interfaces } from "inversify-express-utils";
import { controller, httpGet } from "inversify-express-utils";

@controller("/healthz")
export class MonitoringController implements interfaces.Controller {
  @httpGet("/")
  index(): Record<string, string> {
    return { status: "available" };
  }
}
