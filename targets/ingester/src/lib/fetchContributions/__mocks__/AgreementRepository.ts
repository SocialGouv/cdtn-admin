import { IndexedAgreement } from "@socialgouv/kali-data-types";
import InputAgreement from "./input-agreements.json";
import { AgreementRepository } from "../AgreementRepository";

export class AgreementFile implements AgreementRepository {
  async fetchAll(): Promise<IndexedAgreement[]> {
    return Promise.resolve(InputAgreement as unknown as IndexedAgreement[]);
  }
}
