// apps/web/src/shared/pwa/editors/editorUtils.ts

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

export function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function getNullableString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function getNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function numberOrNull(value: string): number | null {
  if (!value.trim()) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
