module.exports = () => ({
  preset: "ts-jest/presets/js-with-ts-esm",
  transformIgnorePatterns: [
    "node_modules/(?!(@shared/graphql-client|p-limit|yocto-queue)/)",
  ],
});
