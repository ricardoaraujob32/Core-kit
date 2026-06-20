// apps/web/src/shared/validation/uuid.ts

const UUID_REGEX =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;

export function containsUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function removeUuid(
  value: string,
  replacement = "[id técnico oculto]",
): string {
  return value.replace(UUID_REGEX, replacement);
}
