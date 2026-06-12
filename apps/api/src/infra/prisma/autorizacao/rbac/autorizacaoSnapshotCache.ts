// apps/api/src/infra/prisma/autorizacao/rbac/autorizacaoSnapshotCache.ts

import type { LocatarioId, UsuarioId } from "@core-kit/core";
import type { AutorizacaoSnapshot } from "@core-kit/core";

/**
 * Chave primária do cache de snapshot de autorização.
 *
 * O cache é segmentado por:
 * - locatário;
 * - usuário;
 * - escopo de plataforma.
 */
function buildKey(params: {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  isPlataforma?: boolean;
}) {
  return [
    params.locatarioId,
    params.usuarioId,
    params.isPlataforma ? "true" : "false",
  ].join(":");
}

type CacheParams = {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  isPlataforma?: boolean;
};

type CacheEntry = {
  value: AutorizacaoSnapshot;
  expiresAt: number;
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
};

type CreateAutorizacaoSnapshotCacheParams = {
  /**
   * TTL em milissegundos.
   *
   * - `0` ou valor negativo desabilita retenção prática, porque toda leitura expira.
   */
  ttlMs?: number;

  /**
   * Permite desligar completamente o cache sem alterar chamadas existentes.
   *
   * Útil em desenvolvimento e depuração de RBAC/módulos.
   */
  enabled?: boolean;
};

/**
 * Cache em memória para snapshots de autorização.
 *
 * Responsabilidades:
 * - armazenar snapshots por usuário/locatário;
 * - expirar entradas por TTL;
 * - invalidar por chave específica;
 * - invalidar em lote por locatário;
 * - invalidar em lote por usuário;
 * - permitir desabilitação em dev/teste.
 *
 * Observação arquitetural:
 * - em execução com múltiplos processos, este cache é local ao processo;
 * - portanto, invalidação distribuída exigirá mecanismo externo.
 */
export class AutorizacaoSnapshotCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(private readonly ttlMs: number = 60_000) {}

  get(params: {
    locatarioId: LocatarioId;
    usuarioId: UsuarioId;
    isPlataforma?: boolean;
  }): AutorizacaoSnapshot | null {
    console.log("🧪 AutorizacaoSnapshotCache.get DESABILITADO", {
      key: buildKey(params),
    });
    return null;
  }

  set(
    params: {
      locatarioId: LocatarioId;
      usuarioId: UsuarioId;
      isPlataforma?: boolean;
    },
    value: AutorizacaoSnapshot,
  ): void {
    console.log("🧪 AutorizacaoSnapshotCache.set IGNORADO", {
      key: buildKey(params),
      snapshot: value,
    });
  }

  invalidate(params: {
    locatarioId: LocatarioId;
    usuarioId: UsuarioId;
    isPlataforma?: boolean;
  }): void {
    this.entries.delete(buildKey(params));
  }

  clear(): void {
    this.entries.clear();
  }
}

export const autorizacaoSnapshotCache = new AutorizacaoSnapshotCache();