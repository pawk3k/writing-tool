// @ts-check

import eslint from "@eslint/js";
import { globalIgnores } from "@eslint/config-helpers";
import tseslint from "typescript-eslint";
import { flatConfigs } from "eslint-plugin-import";
import { configs as reactPluginHooksConfig } from "eslint-plugin-react-hooks";
import eslintReactPlugin from "eslint-plugin-react";
const recomendedImportConfig = flatConfigs.recommended;

export default tseslint.config(
  globalIgnores([
    "**/*.js",
    "**/*.test.*",
    "**/*.spec.*",
    // Maybe at some point remove *.d.ts, but oke for now
    "**/*.d.ts",
    "packages/plugin-core/.vscode-test/*",
  ]),
  eslint.configs.recommended,
  recomendedImportConfig,
  // In future it would be just recomended not latest
  reactPluginHooksConfig["recommended-latest"],
  eslintReactPlugin.configs.flat.recommended,
  tseslint.configs.recommended,
  // Maybe at some point in future
  // tseslint.configs.recommendedTypeChecked,
  // {
  //   languageOptions: {
  //     parserOptions: {
  //       projectService: true,
  //       tsconfigRootDir: import.meta.dirname,
  //     },
  //   },
  // },
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
