import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // Ignorados
  {
    ignores: ["**/dist/**", "**/build/**", "**/.next/**", "**/node_modules/**"],
  },

  // Regras JS padrão
  js.configs.recommended,

  // Regras TS padrão
  ...tseslint.configs.recommended,

  // Ajustes finais
  {
    rules: {
      // Você pode apertar isso depois:
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
