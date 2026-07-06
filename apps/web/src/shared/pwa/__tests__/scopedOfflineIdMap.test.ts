// apps/web/src/shared/pwa/__tests__/scopedOfflineIdMap.test.ts

import { beforeEach, describe, expect, it } from "vitest";
import { createScopedOfflineIdMap } from "../scopedOfflineIdMap";
import type { PwaScope } from "../pwaScope";

const scopeA: PwaScope = {
  perfil: "tenant",
  locatarioId: "loc-a",
  usuarioId: "user-a",
};

const scopeB: PwaScope = {
  perfil: "tenant",
  locatarioId: "loc-b",
  usuarioId: "user-b",
};

describe("scopedOfflineIdMap", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("registra e resolve ID dentro do mesmo escopo", () => {
    const map = createScopedOfflineIdMap(scopeA);

    map.register({
      kind: "cliente",
      localId: "cliente_offline_1",
      remoteId: "uuid-real",
    });

    expect(map.resolve("cliente", "cliente_offline_1")).toBe("uuid-real");
  });

  it("não resolve ID em outro escopo", () => {
    const mapA = createScopedOfflineIdMap(scopeA);
    const mapB = createScopedOfflineIdMap(scopeB);

    mapA.register({
      kind: "cliente",
      localId: "cliente_offline_1",
      remoteId: "uuid-real",
    });

    expect(mapB.resolve("cliente", "cliente_offline_1")).toBe(
      "cliente_offline_1",
    );
  });

  it("remove mapeamento", () => {
    const map = createScopedOfflineIdMap(scopeA);

    map.register({
      kind: "cliente",
      localId: "cliente_offline_1",
      remoteId: "uuid-real",
    });

    map.remove("cliente", "cliente_offline_1");

    expect(map.resolve("cliente", "cliente_offline_1")).toBe(
      "cliente_offline_1",
    );
  });
});
