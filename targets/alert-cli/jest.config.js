const config = {
  preset: "ts-jest/presets/js-with-ts-esm",
  transformIgnorePatterns: [
    "node_modules/(?!(unist-util-select|zwitch|unist-util-is)/)",
  ],
};

module.exports = config;
