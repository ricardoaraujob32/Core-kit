// apps/web/src/shared/validation/tenantUiPolicy.ts

import { containsUuid } from "./uuid";

export type TenantUiPolicyCheck = {
  ok: boolean;
  reason?: string;
};

/**
 * Regra visual para tenant:
 * textos principais não devem conter UUID.
 */
export function assertTenantVisibleLabel(label: string): TenantUiPolicyCheck {
  if (containsUuid(label)) {
    return {
      ok: false,
      reason: "Texto visível tenant contém UUID técnico.",
    };
  }

  return { ok: true };
}

export function isTenantTechnicalField(fieldName: string): boolean {
  return /(^|_)(id|Id|ID)$/.test(fieldName);
}

export function canShowTechnicalIdInArea(
  area: "tenant" | "superadmin" | "technical",
): boolean {
  return area === "superadmin" || area === "technical";
}
