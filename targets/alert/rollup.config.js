import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import builtins from "builtin-modules";

const plugins = [resolve({ preferBuiltins: true }), commonjs()];
const external = [...builtins, "nodegit"];
const watch = {
  clearScreen: false,
};
export default [
  {
    input: `add-alerts.js`,
    output: [
      {
        file: `dist/add-alerts.js`,
        format: "cjs",
        sourcemap: true,
      },
    ],
    external,
    plugins,
    watch,
  },
  {
    input: `update-alerts.js`,
    output: [
      {
        file: `dist/update-alerts.js`,
        format: "cjs",
        sourcemap: true,
      },
    ],
    external,
    plugins,
    watch,
  },
];
