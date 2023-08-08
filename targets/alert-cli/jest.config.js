const config = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).+(ts|tsx|js)"],
  transformIgnorePatterns: [
    "node_modules/(?!(unist-util-select|zwitch|unist-util-is)/)",
  ],
};

module.exports = config;
