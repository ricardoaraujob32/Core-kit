// apps/web/src/shared/pwa/createOfflineEntity.ts

export function createOfflineId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_offline_${crypto.randomUUID()}`;
  }

  return `${prefix}_offline_${Date.now()}_${Math.random()
    .toString(16)
    .slice(2)}`;
}

export function isOfflineEntityId(id?: string | null): boolean {
  return Boolean(id?.includes("_offline_"));
}

export function markOfflineLabel(label: string): string {
  return label.includes("(pendente)") ? label : `${label} (pendente)`;
}

export function removeOfflineLabel(label: string): string {
  return label.replace(/\s+\(pendente\)$/i, "");
}
