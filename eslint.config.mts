import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier = require('eslint-config-prettier');

export default defineConfig([
  globalIgnores([
    "*.config.mts",
    "*.config.js",
  ]),

  // Spread the strictTypeChecked shared config directly, it includes files matching config
  ...tseslint.configs.strictTypeChecked,

  // Override or add rules and parserOptions
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-unnecessary-type-parameters": "off"
    },
  },

  eslintConfigPrettier,
]);
