import { injectable } from "inversify";

import { wait } from "../../../utils";

@injectable()
export class FakeCopyService {
  async runCopy(): Promise<void> {
    await wait(100);
  }
}
