import { IndexedAgreement } from "@socialgouv/kali-data-types";
import type { AgreementRepository } from "../AgreementRepository";
import InputAgreement from "./input-agreements.json";

export class AgreementMock implements AgreementRepository {
  async fetchAll(): Promise<IndexedAgreement[]> {
    return Promise.resolve(InputAgreement as unknown as IndexedAgreement[]);
  }
}
