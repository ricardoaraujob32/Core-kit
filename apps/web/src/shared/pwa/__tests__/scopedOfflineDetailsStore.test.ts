// apps/web/src/shared/pwa/__tests__/scopedOfflineDetailsStore.test.ts

import { beforeEach, describe, expect, it } from "vitest";
import { createScopedOfflineDetailsStore } from "../scopedOfflineDetailsStore";
import type { PwaScope } from "../pwaScope";

const scope: PwaScope = {
  perfil: "tenant",
  locatarioId: "loc-1",
  usuarioId: "user-1",
};

describe("scopedOfflineDetailsStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("salva e recupera detalhe local", () => {
    const store = createScopedOfflineDetailsStore(scope);

    store.set("transacao", "transacao_offline_1", {
      transacaoId: "transacao_offline_1",
      tipo: "VENDA",
    });

    const envelope = store.getEnvelope<{ transacaoId: string }>(
      "transacao",
      "transacao_offline_1",
    );

    expect(envelope?.detail.transacaoId).toBe("transacao_offline_1");
    expect(envelope?.updatedAt).toBeTruthy();
  });

  it("remove detalhe local", () => {
    const store = createScopedOfflineDetailsStore(scope);

    store.set("transacao", "transacao_offline_1", {
      transacaoId: "transacao_offline_1",
    });

    store.remove("transacao", "transacao_offline_1");

    expect(
      store.getEnvelope("transacao", "transacao_offline_1"),
    ).toBeNull();
  });
});
