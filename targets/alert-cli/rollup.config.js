// we use rollup to create a js bundle and thanks to the monorepo


// transform cjs module to es6
import commonjs from "@rollup/plugin-commonjs";
// Locate and bundle third-party dependencies in node_modules
import resolve from "@rollup/plugin-node-resolve";
// list node builtin modules
import builtins from "builtin-modules";

const plugins = [resolve({ preferBuiltins: true }), commonjs()];
const external = [...builtins, "nodegit"];
const watch = {
  clearScreen: false,
};
export default [
  {
    input: `src/index.js`,
    output: [
      {
        file: `dist/index.js`,
        format: "cjs",
        sourcemap: true,
      },
    ],
    external,
    plugins,
    watch,
  },
];
