/**
 * Colour guard — shared between the main ESLint config and the dedicated
 * `pnpm lint:colors` check.
 *
 * Every visual colour must come from the tokens in app/globals.css.
 * The only file allowed to hold literal colours is lib/brand-colors.ts
 * (transactional email, metadata and generated assets).
 */
export const colorGuardConfig = {
  files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
  ignores: ["lib/brand-colors.ts"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
        message:
          "Hard-coded hex colour. Use a design token (bg-primary, text-ink, border-line, ...) instead. Literal brand colours belong in lib/brand-colors.ts.",
      },
      {
        selector: "Literal[value=/(?:rgb|hsl)a?\\(/]",
        message: "Hard-coded rgb()/hsl() colour. Use a design token instead.",
      },
      {
        selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]",
        message:
          "Hard-coded hex colour in a template string. Use a design token or BRAND from lib/brand-colors.ts.",
      },
      {
        selector: "TemplateElement[value.raw=/(?:rgb|hsl)a?\\(/]",
        message:
          "Hard-coded rgb()/hsl() colour in a template string. Use a design token or BRAND from lib/brand-colors.ts.",
      },
    ],
  },
};
