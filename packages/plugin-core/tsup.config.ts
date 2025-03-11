import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/extension.ts"],
  external: ["vscode"],
  noExternal: ["unist", "unified", "vfile", "@dendronhq/common-all"], // Explicitly include these packages
  format: ["cjs"],
  platform: "node",
  dts: false,
  sourcemap: true,
  clean: true,
  minify: false,
});
