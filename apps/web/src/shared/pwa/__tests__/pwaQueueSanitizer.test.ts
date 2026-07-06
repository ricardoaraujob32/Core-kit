// apps/web/src/shared/pwa/__tests__/pwaQueueSanitizer.test.ts

import { beforeEach, describe, expect, it } from "vitest";
import { sanitizeScopedOfflineQueue } from "../pwaQueueSanitizer";
import { createScopedOfflineQueue } from "../scopedOfflineQueue";
import type { PwaScope } from "../pwaScope";

const scope: PwaScope = {
  perfil: "tenant",
  locatarioId: "loc-1",
  usuarioId: "user-1",
};

describe("pwaQueueSanitizer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("normaliza payload válido antigo", () => {
    const queue = createScopedOfflineQueue(scope);

    queue.enqueue({
      type: "clientes.criar",
      payload: {
        nome: "  Ana  ",
        email: "",
      },
      localId: "cliente_offline_1",
    });

    const report = sanitizeScopedOfflineQueue(scope);

    expect(report.normalized).toBe(1);
    expect(queue.list()[0].payload).toEqual({
      nome: "Ana",
      documento: null,
      email: null,
      telefone: null,
    });
  });

  it("bloqueia payload inválido antigo", () => {
    const queue = createScopedOfflineQueue(scope);

    queue.enqueue({
      type: "clientes.criar",
      payload: {
        nome: "",
      },
      localId: "cliente_offline_1",
    });

    const report = sanitizeScopedOfflineQueue(scope);
    const item = queue.list()[0];

    expect(report.blocked).toBe(1);
    expect(item.status).toBe("blocked");
    expect(item.lastErrorKind).toBe("validation");
  });
});
