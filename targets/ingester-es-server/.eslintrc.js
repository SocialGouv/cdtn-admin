module.exports = {
  extends: "@socialgouv/eslint-config-typescript",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/member-ordering": "warn",
    "@typescript-eslint/no-explicit-any": "off",
  },
  settings: {
    jest: {
      version: 26,
    },
  },
};
