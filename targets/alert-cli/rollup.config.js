// we use rollup to create a js bundle and thanks to the monorepo

// transform cjs module to es6
import commonjs from "@rollup/plugin-commonjs";
// Converts .json files to ES6 modules.
import json from "@rollup/plugin-json";
// Locate and bundle third-party dependencies in node_modules
import resolve from "@rollup/plugin-node-resolve";
// list node builtin modules
import builtins from "builtin-modules";

const plugins = [json(), resolve({ preferBuiltins: true }), commonjs()];
const external = [...builtins, "nodegit"];
const watch = {
  clearScreen: false,
};
export default [
  {
    external,
    input: `src/index.js`,
    output: [
      {
        file: `dist/index.js`,
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins,
    watch,
  },
];
