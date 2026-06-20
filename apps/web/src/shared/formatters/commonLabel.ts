
export function cleanText(value?: string | null): string | null {
  const text = value?.trim();
  return text ? text : null;
}

export function joinLabelParts(parts: Array<string | null | undefined>, separator = " — "): string {
  return parts.filter(Boolean).join(separator);
}

export function shortCode(value?: string | null, length = 8): string {
  if (!value) {
    return "-";
  }

  return value.slice(0, length).toUpperCase();
}
