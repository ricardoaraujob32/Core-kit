// packages/core/vitest.config.ts

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "__tests__/**/*.test.ts",
      "__tests__/**/*.spec.ts"
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/__tests_legacy__/**"
    ]
  }
});