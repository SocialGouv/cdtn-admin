export type AgreementsInsertInput = {
  id: string;
  isSupported: boolean;
  kali_id?: string;
  legifranceUrl?: string;
  name: string;
  rootText?: string;
  shortName: string;
  workerNumber: number;
  updatedAt?: string;
  synonyms?: string[];
};
