/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  transform: {
    "^.+\\.(t|j)s$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2021",
        },
      },
    ],
  },
  setupFiles: ["reflect-metadata"],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
};
