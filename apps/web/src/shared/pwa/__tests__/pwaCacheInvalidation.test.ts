// apps/web/src/shared/pwa/__tests__/pwaCacheInvalidation.test.ts

import { describe, expect, it } from "vitest";
import {
  getCacheKeysAffectedByQueueItem,
  PWA_RESOURCE_CACHE_KEYS,
} from "../pwaCacheInvalidation";
import type { PwaQueueItem } from "../pwaSyncTypes";

function item(type: string): PwaQueueItem {
  return {
    id: "queue-1",
    type,
    payload: {},
    localId: "local-1",
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    attempts: 0,
    lastError: null,
    lastErrorKind: null,
    lastErrorDetails: null,
  };
}

describe("pwaCacheInvalidation", () => {
  it("invalida clientes ao sincronizar cliente", () => {
    expect(getCacheKeysAffectedByQueueItem(item("clientes.criar"))).toEqual([
      PWA_RESOURCE_CACHE_KEYS.clientes,
    ]);
  });

  it("invalida produtos e serviços ao sincronizar serviço", () => {
    expect(getCacheKeysAffectedByQueueItem(item("servicos.criar"))).toEqual([
      PWA_RESOURCE_CACHE_KEYS.produtos,
      PWA_RESOURCE_CACHE_KEYS.servicos,
    ]);
  });

  it("invalida transações e financeiro ao sincronizar venda", () => {
    expect(getCacheKeysAffectedByQueueItem(item("vendas.criar"))).toEqual([
      PWA_RESOURCE_CACHE_KEYS.transacoes,
      PWA_RESOURCE_CACHE_KEYS.financeiro,
    ]);
  });

  it("invalida transações, produtos e financeiro ao sincronizar item", () => {
    expect(
      getCacheKeysAffectedByQueueItem(item("transacoes.itens.adicionar")),
    ).toEqual([
      PWA_RESOURCE_CACHE_KEYS.transacoes,
      PWA_RESOURCE_CACHE_KEYS.produtos,
      PWA_RESOURCE_CACHE_KEYS.financeiro,
    ]);
  });
});
