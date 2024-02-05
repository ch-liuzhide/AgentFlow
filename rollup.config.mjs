import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import postcss from "rollup-plugin-postcss";

export default [
  {
    input: "./index.ts",
    external: ["test/**"],
    output: [
      {
        dir: "lib",
        format: "cjs",
        entryFileNames: "[name].cjs.js",
        sourcemap: false,
      },
      {
        dir: "lib",
        format: "esm",
        entryFileNames: "[name].esm.js",
        sourcemap: false,
      },
      {
        dir: "lib",
        format: "umd",
        entryFileNames: "[name].umd.js",
        name: "$AgentFlow", // umd 模块名称，相当于一个命名空间，会自动挂载到window下面
        sourcemap: false,
        plugins: [terser()],
      },
    ],
    plugins: [
      postcss({
        minimize: true,
        extensions: [".css"],
        extract: true,
      }),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        compilerOptions: {
          incremental: false,
        },
      }),
    ],
  },
];
