import { injectable } from "inversify";

import { name } from "../utils";

@injectable()
@name("IngesterService")
export class IngesterService {
  get(): Record<string, string> {
    return { test: "yo" };
  }
}
