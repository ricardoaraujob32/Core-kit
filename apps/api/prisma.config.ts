import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
      url: process.env.DATABASE_URL || "postgresql://teste:teste@localhost:5432/teste",
  },
});
