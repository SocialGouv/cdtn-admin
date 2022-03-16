import { injectable } from "inversify";

import { name } from "../utils";

@injectable()
@name("BaseService")
export class BaseService {
  get(): Record<string, string> {
    return { status: "ok" };
  }
}
