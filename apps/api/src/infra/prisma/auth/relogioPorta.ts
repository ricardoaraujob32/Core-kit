// apps/api/src/infra/prisma/auth/relogioPorta.ts

import type { RelogioPorta } from "@core-kit/core";

/**
 * 
 * @returns 
 */
export function createRelogioPorta(): RelogioPorta {
  return {
    agora: () => new Date(),
  };
}
