// backend/src/test/prismaTestClient.ts
import { PrismaClient } from "@prisma/client";

export const prismaTest = new PrismaClient({
  log: ["error", "warn"],
});