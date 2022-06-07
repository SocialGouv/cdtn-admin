import type { IndexedAgreement } from "@socialgouv/kali-data-types";

import { getJson } from "../getJson";

export class AgreementRepository {
  constructor() {
    this.pkgName = "@socialgouv/kali-data";
  }

  public async fetchAll(): Promise<IndexedAgreement[]> {
    const agreements = await getJson<IndexedAgreement[]>(
      `${this.pkgName}/data/index.json`
    );
    return agreements;
  }

  private readonly pkgName: string;
}
