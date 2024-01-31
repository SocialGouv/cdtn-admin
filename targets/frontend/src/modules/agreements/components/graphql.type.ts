export type AgreementsInsertInput = {
  id: string;
  isSupported: boolean;
  kali_id?: string | null;
  legifranceUrl?: string | null;
  name: string;
  rootText?: string | null;
  shortName: string;
  workerNumber?: number | null;
  updatedAt?: string | null;
  synonyms: string[];
};
