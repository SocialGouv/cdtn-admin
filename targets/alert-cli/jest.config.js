const config = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).+(ts|tsx|js)"],
  transformIgnorePatterns: [
    "node_modules/(?!(\\.pnpm|unist-util-select|zwitch|unist-util-is|axios))",
    "\\.pnpm/(?!(unist-util-select|zwitch|unist-util-is|axios)@)",
  ],
};

module.exports = config;
