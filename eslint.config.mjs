import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { fixupConfigRules } from "@eslint/compat";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "e2e-prod-test/**",
      "src/migrations/**",
    ],
  },
  ...fixupConfigRules(compat.extends("next/core-web-vitals")),
  ...tseslint.configs.recommended,
  {
    rules: {
      // Warn on any, don't error (we'll fix gradually)
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      // Allow require imports in config files
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
