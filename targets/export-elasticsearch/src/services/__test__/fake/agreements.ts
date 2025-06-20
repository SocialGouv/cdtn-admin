import { injectable } from "inversify";

import { wait } from "../../../utils";

@injectable()
export class FakeAgreementsService {
  async uploadAgreements(): Promise<void> {
    await wait(100);
  }
}
