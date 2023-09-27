const config = {
  clearMocks: true,
  coverageDirectory: "coverage",
  preset: "ts-jest/presets/js-with-ts-esm",
  collectCoverageFrom: ["src/**/*.ts", "!**/node_modules/**"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/data/"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!(strip-markdown)/)"],
};

module.exports = config;
