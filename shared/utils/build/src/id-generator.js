"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIds = exports.generateInitialId = exports.generateCdtnId = exports.MAX_ID_LENGTH = void 0;
const uuid_1 = require("uuid");
const xxhashjs_1 = __importDefault(require("xxhashjs"));
const H = xxhashjs_1.default.h64(0x1e7f);
exports.MAX_ID_LENGTH = 10;
// use xxhash to hash source + newly generated UUID
const generateCdtnId = (content, maxIdLength = exports.MAX_ID_LENGTH) => 
// save 64bits hash as Hexa string up to maxIdLength chars (can be changed later in case of collision)
// as the xxhash function ensure distribution property
H.update(content).digest().toString(16).slice(0, maxIdLength);
exports.generateCdtnId = generateCdtnId;
const generateInitialId = () => {
    return (0, uuid_1.v4)();
};
exports.generateInitialId = generateInitialId;
const generateIds = (source, maxIdLength = exports.MAX_ID_LENGTH) => {
    const uuid = (0, uuid_1.v4)();
    return {
        cdtn_id: (0, exports.generateCdtnId)(source + uuid, maxIdLength),
        initial_id: (0, exports.generateInitialId)(),
    };
};
exports.generateIds = generateIds;
//# sourceMappingURL=id-generator.js.map