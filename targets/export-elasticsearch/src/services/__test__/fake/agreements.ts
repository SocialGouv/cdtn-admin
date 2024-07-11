import { injectable } from "inversify";

import { wait } from "../../../utils";
import { Environment } from "@socialgouv/cdtn-types";

@injectable()
export class FakeAgreementsService {
  async uploadAgreements(
    environment: Environment,
    destinationFolder: string,
    destinationName: string
  ): Promise<void> {
    await wait(100);
  }
}
