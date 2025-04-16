// @ts-check

import eslint from "@eslint/js";
import { globalIgnores } from "@eslint/config-helpers";
import tseslint from "typescript-eslint";
import { flatConfigs } from "eslint-plugin-import";
import { configs as reactPluginHooksConfig } from "eslint-plugin-react-hooks";
import eslintReactPlugin from "eslint-plugin-react";
const recomendedImportConfig = flatConfigs.recommended;

export default tseslint.config(
  // Maybe at some point remove *.d.ts, but oke for now
  globalIgnores(["**/*.js", "**/*.test.*", "**/*.spec.*", "**/*.d.ts"]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  recomendedImportConfig,
  // In future it would be just recomended not latest
  reactPluginHooksConfig["recommended-latest"],
  eslintReactPlugin.configs.flat.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "import/no-unresolved": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          caughtErrors: "none",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
        },
      ],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  }
);
