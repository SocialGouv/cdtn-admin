module.exports = {
  "env": {
    "browser": false,
    "es6": true,
    "node": true,
    "jest/globals": true
  },
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  },
  "overrides": [
    {
      "files": ["*.js"],
      "plugins": ["jest"],
      "extends": [
        "eslint:recommended",
        "prettier"
      ],
      "rules": {
        "no-async-promise-executor": "warn",
      }
    },
    {
      "files": ["*.ts", "*.tsx"],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "project": "./tsconfig.json"
      },
      "plugins": ["@typescript-eslint", "jest"],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier"
      ],
      "rules": {
        "no-async-promise-executor": "warn",
        "@typescript-eslint/consistent-type-definitions": "warn",
        "@typescript-eslint/no-require-imports": "warn",
        "@typescript-eslint/prefer-nullish-coalescing": "warn",
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/no-unnecessary-condition": "warn",
        "@typescript-eslint/naming-convention": "warn",
        "@typescript-eslint/no-implicit-any-catch": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/no-floating-promises": "warn",
        "@typescript-eslint/restrict-plus-operands": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn",
        "@typescript-eslint/no-shadow": "warn",
        "@typescript-eslint/prefer-optional-chain": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-throw-literal": "warn",
        "@typescript-eslint/no-misused-promises": "warn",
        "@typescript-eslint/require-await": "warn",
        "@typescript-eslint/ban-ts-comment": "warn",
        "@typescript-eslint/no-misused-promises": "warn"
      }
    }
  ]
}
