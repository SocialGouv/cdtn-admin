module.exports = {
  extends: "@socialgouv/eslint-config-typescript",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/member-ordering": "warn",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/init-declarations": "warn",
  },
  settings: {
    jest: {
      version: 27,
    },
  },
};
