// apps/api/vitest.config.ts

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@core-kit/core": path.resolve(__dirname, "../../packages/core/src"),
      "@core-kit/api": path.resolve(__dirname, "./src"),
      "@core-kit/api/": path.resolve(__dirname, "./src") + "/",
      "@env": path.resolve(__dirname, "./src/env.ts"),
    },
  },

  test: {
    environment: "node",
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "test-secret-123456789",
      JWT_ISSUER: "test-issuer",
      DATABASE_URL: "postgresql://teste:teste@localhost:5432/teste",
    },

    include: [
      "__tests__/**/*.test.ts",
      "__tests__/**/*.spec.ts",
    ],

    exclude: [
      "**/node_modules/**",
      "**/dist/**",
    ],
  },
});