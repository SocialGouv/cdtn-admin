import type { IndexedAgreement } from "@socialgouv/kali-data-types";

import { getJson } from "../getJson";

export interface AgreementRepository {
  fetchAll: () => Promise<IndexedAgreement[]>;
}

export class AgreementFile implements AgreementRepository {
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
