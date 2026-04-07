// apps/api/src/infra/prisma/autorizacao/rbac/autorizacaoSnapshotCache.ts

import type { LocatarioId, UsuarioId } from "@core-kit/core";
import type { AutorizacaoSnapshot } from "@core-kit/core";

/**
 * 
 * @param params 
 * @returns 
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

/**
 * 
 */
type CacheEntry = {
  value: AutorizacaoSnapshot;
  expiresAt: number;
};

/**
 * 
 */
export class AutorizacaoSnapshotCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(private readonly ttlMs: number = 60_000) {}

  get(params: {
    locatarioId: LocatarioId;
    usuarioId: UsuarioId;
    isPlataforma?: boolean;
  }): AutorizacaoSnapshot | null {
    const key = buildKey(params);
    const entry = this.entries.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return null;
    }

    return entry.value;
  }

  set(
    params: {
      locatarioId: LocatarioId;
      usuarioId: UsuarioId;
      isPlataforma?: boolean;
    },
    value: AutorizacaoSnapshot,
  ): void {
    const key = buildKey(params);

    this.entries.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
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

/**
 * 
 */
export const autorizacaoSnapshotCache = new AutorizacaoSnapshotCache();
