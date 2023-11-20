"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const core_1 = require("@urql/core");
const isomorphic_unfetch_1 = __importDefault(require("isomorphic-unfetch"));
const HASURA_GRAPHQL_ADMIN_SECRET = (_a = process.env.HASURA_GRAPHQL_ADMIN_SECRET) !== null && _a !== void 0 ? _a : "admin1";
const HASURA_GRAPHQL_ENDPOINT = (_b = process.env.HASURA_GRAPHQL_ENDPOINT) !== null && _b !== void 0 ? _b : "http://localhost:8080/v1/graphql";
exports.client = (0, core_1.createClient)({
    fetch: isomorphic_unfetch_1.default,
    fetchOptions: {
        headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": HASURA_GRAPHQL_ADMIN_SECRET,
        },
    },
    maskTypename: true,
    requestPolicy: "network-only",
    url: HASURA_GRAPHQL_ENDPOINT,
});
