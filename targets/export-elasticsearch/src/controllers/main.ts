import type { interfaces } from "inversify-express-utils";
import { controller, httpGet } from "inversify-express-utils";

@controller("/")
export class MainController implements interfaces.Controller {
  @httpGet("/")
  index(): Record<string, string> {
    return { status: "available" };
  }
}
