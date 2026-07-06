// apps/web/src/shared/pwa/__tests__/scopedOfflineQueue.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createScopedOfflineQueue } from "../scopedOfflineQueue";
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

describe("scopedOfflineQueue", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mantém filas isoladas por escopo", () => {
    const queueA = createScopedOfflineQueue(scopeA);
    const queueB = createScopedOfflineQueue(scopeB);

    queueA.enqueue({
      type: "clientes.criar",
      payload: { nome: "Cliente A" },
      localId: "cliente_offline_a",
    });

    expect(queueA.list()).toHaveLength(1);
    expect(queueB.list()).toHaveLength(0);
  });

  it("processa itens do mais antigo para o mais novo", async () => {
    const queue = createScopedOfflineQueue(scopeA);
    const order: string[] = [];

    queue.enqueue({
      type: "clientes.criar",
      payload: { nome: "Primeiro" },
      localId: "cliente_offline_1",
    });

    queue.enqueue({
      type: "vendas.criar",
      payload: { clienteId: "cliente_offline_1" },
      localId: "transacao_offline_1",
    });

    await queue.process(async (item) => {
      order.push(item.type);
    });

    expect(order).toEqual(["clientes.criar", "vendas.criar"]);
    expect(queue.list()).toHaveLength(0);
  });

  it("marca item como failed quando processor lança erro retryable", async () => {
    const queue = createScopedOfflineQueue(scopeA);

    queue.enqueue({
      type: "clientes.criar",
      payload: { nome: "Cliente" },
      localId: "cliente_offline_1",
    });

    await queue.process(async () => {
      throw new Error("falha temporária");
    });

    const [item] = queue.list();

    expect(item.status).toBe("failed");
    expect(item.lastError).toBeTruthy();
  });

  it("remove item da fila", () => {
    const queue = createScopedOfflineQueue(scopeA);

    const item = queue.enqueue({
      type: "clientes.criar",
      payload: { nome: "Cliente" },
      localId: "cliente_offline_1",
    });

    queue.remove(item.id);

    expect(queue.list()).toHaveLength(0);
  });

  it("bloqueia e desbloqueia item", () => {
    const queue = createScopedOfflineQueue(scopeA);

    const item = queue.enqueue({
      type: "clientes.criar",
      payload: { nome: "Cliente" },
      localId: "cliente_offline_1",
    });

    queue.block(item.id, "bloqueado");

    expect(queue.list()[0].status).toBe("blocked");

    queue.unblock(item.id);

    expect(queue.list()[0].status).toBe("pending");
  });
});
