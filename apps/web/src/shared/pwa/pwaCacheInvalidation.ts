// apps/web/src/shared/pwa/pwaCacheInvalidation.ts

import { offlineStorage } from "./offlineStorage";
import { buildPwaCacheKey, type PwaScope } from "./pwaScope";
import { emitPwaCacheInvalidated } from "./pwaSyncEvents";
import type { PwaQueueItem } from "./pwaSyncTypes";

export const PWA_RESOURCE_CACHE_KEYS = {
  clientes: "clientes:list",
  fornecedores: "fornecedores:list",
  produtos: "produtos:list",
  servicos: "servicos:list",
  ordensServico: "ordens-servico:list",
  transacoes: "transacoes:list",
  financeiro: "financeiro:resumo",
} as const;

export function getCacheKeysAffectedByQueueItem(item: PwaQueueItem): string[] {
  switch (item.type) {
    case "clientes.criar":
      return [PWA_RESOURCE_CACHE_KEYS.clientes];

    case "fornecedores.criar":
      return [PWA_RESOURCE_CACHE_KEYS.fornecedores];

    case "servicos.criar":
      return [
        PWA_RESOURCE_CACHE_KEYS.produtos,
        PWA_RESOURCE_CACHE_KEYS.servicos,
      ];

    case "ordensServico.criar":
      return [
        PWA_RESOURCE_CACHE_KEYS.ordensServico,
        PWA_RESOURCE_CACHE_KEYS.transacoes,
      ];

    case "vendas.criar":
    case "compras.criar":
      return [
        PWA_RESOURCE_CACHE_KEYS.transacoes,
        PWA_RESOURCE_CACHE_KEYS.financeiro,
      ];

    case "transacoes.itens.adicionar":
    case "transacoes.itens.atualizar":
    case "transacoes.itens.remover":
      return [
        PWA_RESOURCE_CACHE_KEYS.transacoes,
        PWA_RESOURCE_CACHE_KEYS.produtos,
        PWA_RESOURCE_CACHE_KEYS.financeiro,
      ];

    default:
      return [];
  }
}

export function invalidateScopedCacheKeys(params: {
  scope: PwaScope;
  keys: string[];
  reason: string;
}) {
  const scopedKeys = params.keys.map((key) =>
    buildPwaCacheKey(params.scope, key),
  );

  for (const key of scopedKeys) {
    offlineStorage.removeCache(key);
  }

  emitPwaCacheInvalidated({
    keys: params.keys,
    reason: params.reason,
  });
}

export function invalidateCachesForSyncedItem(params: {
  scope: PwaScope;
  item: PwaQueueItem;
}) {
  const keys = getCacheKeysAffectedByQueueItem(params.item);

  if (keys.length === 0) return;

  invalidateScopedCacheKeys({
    scope: params.scope,
    keys,
    reason: params.item.type,
  });
}
