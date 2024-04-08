import { gqlClient } from "@shared/utils";
import { injectable } from "inversify";

import { name } from "../utils";
import { listSupportedAgreements } from "./graphql";

@injectable()
@name("AgreementsRepository")
export class AgreementsRepository {
  public async list(): Promise<unknown> {
    const res = await gqlClient()
      .query<{ agreements: unknown }>(listSupportedAgreements, {})
      .toPromise();
    if (res.error || !res.data) {
      throw new Error(`Failed to get agreements : ${res.error}`);
    }
    return res.data.agreements;
  }
}
