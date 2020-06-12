import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import builtins from "builtin-modules";

const plugins = [resolve({ preferBuiltins: true }), commonjs()];
const external = [...builtins];
const watch = {
  clearScreen: false,
};
export default [
  {
    input: `update-alert.js`,
    output: [
      {
        file: `dist/update-alert.js`,
        format: "cjs",
        sourcemap: true,
      },
    ],
    external,
    plugins,
    watch,
  },
];
