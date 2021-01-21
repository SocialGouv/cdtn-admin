const { v4 } = require("uuid");
const XXH = require("xxhashjs");

const H = XXH.h64(0x1e7f);

const MAX_ID_LENGTH = 10;

// use xxhash to hash source + newly generated UUID
/**
 *
 * @param {string} content
 * @param {number} maxIdLength
 * @returns {string}
 */
const generateCdtnId = (content, maxIdLength = MAX_ID_LENGTH) =>
  // save 64bits hash as Hexa string up to maxIdLength chars (can be changed later in case of collision)
  // as the xxhash function ensure distribution property
  H.update(content).digest().toString(16).slice(0, maxIdLength);

const generateInitialId = v4;

module.exports = {
  generateIds: (source, maxIdLength = MAX_ID_LENGTH) => {
    const uuid = v4();
    return {
      cdtn_id: generateCdtnId(source + uuid, maxIdLength),
      initial_id: generateInitialId(),
    }
  }
};
