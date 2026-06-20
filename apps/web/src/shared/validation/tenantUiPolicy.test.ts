// apps/web/src/shared/validation/tenantUiPolicy.test.ts

import { describe, expect, it } from "vitest";
import {
  assertTenantVisibleLabel,
  canShowTechnicalIdInArea,
  containsUuid,
  removeUuid,
} from ".";

describe("tenant UI policy", () => {
  it("detecta UUID em texto visível", () => {
    expect(
      containsUuid("Cliente 550e8400-e29b-41d4-a716-446655440000"),
    ).toBe(true);
  });

  it("aprova label de domínio sem UUID", () => {
    expect(assertTenantVisibleLabel("Cliente João Silva").ok).toBe(true);
  });

  it("reprova label tenant com UUID", () => {
    const result = assertTenantVisibleLabel(
      "Produto 550e8400-e29b-41d4-a716-446655440000",
    );

    expect(result.ok).toBe(false);
  });

  it("remove UUID de texto", () => {
    expect(
      removeUuid("ID 550e8400-e29b-41d4-a716-446655440000"),
    ).toBe("ID [id técnico oculto]");
  });

  it("permite ID técnico em superadmin e bloco técnico", () => {
    expect(canShowTechnicalIdInArea("superadmin")).toBe(true);
    expect(canShowTechnicalIdInArea("technical")).toBe(true);
    expect(canShowTechnicalIdInArea("tenant")).toBe(false);
  });
});
