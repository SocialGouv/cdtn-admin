import { injectable } from "inversify";

import { wait } from "../../../utils";

@injectable()
export class FakeCopyService {
  async runCopy(
    sourceContainerName: string,
    destinationContainerName: string
  ): Promise<void> {
    await wait(100);
  }
}
