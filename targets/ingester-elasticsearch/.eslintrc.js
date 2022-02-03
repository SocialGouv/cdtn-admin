module.exports = {
  extends: "@socialgouv/eslint-config-typescript",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/member-ordering": "warn",
  },
  settings: {
    jest: {
      version: 26,
    },
  },
};
