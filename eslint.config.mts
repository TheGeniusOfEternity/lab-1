import * as js from '@eslint/js';
import * as globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier = require('eslint-config-prettier');

export default defineConfig([
  globalIgnores([
    "*.config.mts",
    "*.config.js"
  ]),
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  tseslint.configs.recommended,
  eslintConfigPrettier,
]);
