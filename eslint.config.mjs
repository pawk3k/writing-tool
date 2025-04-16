import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import("@eslint/compat").FlatConfig[]} */
const baseConfig = [
  {
    ignores: [
      ".yarn/**",
      "vendor/**/*",
      "**/node_modules",
      "**/lib/**/*",
      "**/out/**/*",
      "packages/engine-server/src/drivers/generated-prisma-client/",
      "packages/engine-server/src/generated-prisma-client/",
    ],
  },
];

export default tseslint.config(
  baseConfig,
  eslint.configs.recommended,
  tseslint.configs.recommended
);
