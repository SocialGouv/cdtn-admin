module.exports = {
  extends: "@socialgouv/eslint-config-typescript",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/member-ordering": "off",
    "@typescript-eslint/no-floating-promises": "off",
  },
  settings: {
    jest: {
      version: 27,
    },
  },
};
