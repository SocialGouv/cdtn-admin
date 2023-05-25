import { getJson } from "../../lib/getJson";

export const CODE_DU_TRAVAIL_ID = "LEGITEXT000006072050";

export const loadCodeDuTravail = async (): Promise<LegiData.Code> =>
  getJson<LegiData.Code>(
    `@socialgouv/legi-data/data/${CODE_DU_TRAVAIL_ID}.json`
  );
