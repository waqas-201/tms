import tsParser from "@typescript-eslint/parser";
import { colorGuardConfig } from "./eslint.color-guard.mjs";

/**
 * Standalone colour-only lint. Keeps `pnpm lint:colors` focused on the one
 * rule so unrelated (pre-existing) lint findings cannot mask a colour leak.
 */
export default [
  {
    ...colorGuardConfig,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
  },
];
