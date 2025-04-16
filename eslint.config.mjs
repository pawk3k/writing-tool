// @ts-check

import eslint from "@eslint/js";
import { globalIgnores } from "@eslint/config-helpers";
import tseslint from "typescript-eslint";

export default tseslint.config(
  globalIgnores(["**/*.js", "**/*.test.*", "**/*.spec.*"]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  }
);
