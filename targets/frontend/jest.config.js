const nextJest = require("next/jest");

const createJestConfig = nextJest();

const customJestConfig = {
  collectCoverageFrom: ["!src/**/*mock.js", "src/**/*.js"],
  modulePaths: ["<rootDir>"],
  preset: "ts-jest/presets/js-with-babel",
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/__tests__/**/*?(*.)+(test|spec).[jt]s?(x)"],
  transformIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};

module.exports = createJestConfig(customJestConfig);
