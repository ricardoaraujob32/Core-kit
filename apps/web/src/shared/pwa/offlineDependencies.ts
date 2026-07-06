// apps/web/src/shared/pwa/offlineDependencies.ts

import { isOfflineEntityId } from "./createOfflineEntity";
import { resolveOfflineId, type OfflineEntityKind } from "./offlineIdMap";

export class OfflineDependencyNotResolvedError extends Error {
  code = "DEPENDENCIA_OFFLINE_NAO_RESOLVIDA";

  constructor(
    public readonly kind: OfflineEntityKind,
    public readonly localId: string,
  ) {
    super(`Dependência offline ainda não resolvida: ${kind}:${localId}`);
  }
}

export function resolveRequiredOfflineDependency(
  kind: OfflineEntityKind,
  id: string | null | undefined,
  label: string,
): string {
  if (!id) {
    throw new Error(`ID obrigatório ausente: ${label}`);
  }

  const resolved = resolveOfflineId(kind, id);

  if (!resolved) {
    throw new Error(`ID obrigatório não resolvido: ${label}`);
  }

  if (isOfflineEntityId(resolved)) {
    throw new OfflineDependencyNotResolvedError(kind, resolved);
  }

  return resolved;
}

export function resolveOptionalOfflineDependency(
  kind: OfflineEntityKind,
  id: string | null | undefined,
): string | null {
  if (!id) return null;

  const resolved = resolveOfflineId(kind, id);

  if (resolved && isOfflineEntityId(resolved)) {
    throw new OfflineDependencyNotResolvedError(kind, resolved);
  }

  return resolved;
}
