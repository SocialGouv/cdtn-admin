"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFichesSpRefLocal = exports.generateFichesSpRef = exports.generateLegiRef = exports.generateKaliRef = void 0;
const cdtn_utils_1 = require("@socialgouv/cdtn-utils");
const generateKaliRef = (kaliArticleId, agreementId) => {
    return `https://legifrance.gouv.fr/conv_coll/id/${kaliArticleId}/?idConteneur=${agreementId}`;
};
exports.generateKaliRef = generateKaliRef;
const generateLegiRef = (legiArticleTitle, withPrefix = true) => {
    return `${withPrefix ? "https://code.travail.gouv.fr" : ""}/code-du-travail/${(0, cdtn_utils_1.slugify)(legiArticleTitle)}`;
};
exports.generateLegiRef = generateLegiRef;
const generateFichesSpRef = (audience, ficheSpInitialId) => {
    return `https://www.service-public.fr/${audience}/vosdroits/${ficheSpInitialId}`;
};
exports.generateFichesSpRef = generateFichesSpRef;
const generateFichesSpRefLocal = (urlSlug, withPrefix = true) => {
    return `${withPrefix ? "https://code.travail.gouv.fr" : ""}/fiche-service-public/${urlSlug}`;
};
exports.generateFichesSpRefLocal = generateFichesSpRefLocal;
//# sourceMappingURL=url-generator.js.map