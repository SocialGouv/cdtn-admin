import { v4 as uuidv4 } from "uuid";
import * as XXH from "xxhashjs";

const H = XXH.h64(0x1e7f);

export const maxIdLength = 10;

// use xxhash to hash source + newly generated UUID
export const generateCdtnId = (content, maxIdLength = maxIdLength) =>
  // save 64bits hash as Hexa string up to maxIdLength chars (can be changed later in case of collision)
  // as the xxhash function ensure distribution property
  H.update(content).digest().toString(16).slice(0, maxIdLength);

export const generateInitialId = uuidv4;

// Beware, you might be generating an already existing cdtn_id
export const generateIds = (source, maxIdLength = maxIdLength) => {
  const uuid = uuidv4();
  return {
    cdtn_id: generateCdtnId(source + uuid, maxIdLength),
    initial_id: generateInitialId(),
  };
};
