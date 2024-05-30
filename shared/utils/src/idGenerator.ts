import { v4 as uuidv4 } from "uuid";
import XXH from "xxhashjs";

const H = XXH.h64(0x1e7f);

export const MAX_ID_LENGTH = 10;

// use xxhash to hash source + newly generated UUID
export const generateCdtnId = (content: string, maxIdLength = MAX_ID_LENGTH) =>
  // save 64bits hash as Hexa string up to maxIdLength chars (can be changed later in case of collision)
  // as the xxhash function ensure distribution property
  H.update(content).digest().toString(16).slice(0, maxIdLength);

export const generateInitialId = (): string => {
  return uuidv4();
};

export const generateIds = (
  source: string,
  maxIdLength = MAX_ID_LENGTH
): {
  cdtn_id: string;
  initial_id: string;
} => {
  const uuid = uuidv4();
  return {
    cdtn_id: generateCdtnId(source + uuid, maxIdLength),
    initial_id: generateInitialId(),
  };
};
