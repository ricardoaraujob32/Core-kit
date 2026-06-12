// apps/api/src/infra/prisma/auth/idPorta.ts

import { randomUUID } from "node:crypto";
import type { IdPorta } from "@core-kit/core";

/**
 * 
 * @returns 
 */
export function createIdPorta(): IdPorta {
  return {
    gerarId: () => randomUUID(),
  };
}
