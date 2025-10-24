module.exports = {
  extends: ["@shared/eslint-config"],
  rules: {
    "@typescript-eslint/naming-convention": "off",
  },
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
};
