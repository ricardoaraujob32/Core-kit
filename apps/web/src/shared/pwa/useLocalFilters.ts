// apps/web/src/shared/pwa/useLocalFilters.ts

import { useMemo, useState } from "react";

export function normalizeSearchText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function containsText(value: unknown, filter: string): boolean {
  const normalizedFilter = normalizeSearchText(filter);

  if (!normalizedFilter) return true;

  return normalizeSearchText(value).includes(normalizedFilter);
}

export function useLocalFilters<TItem, TFilters extends Record<string, string>>(
  items: TItem[],
  initialFilters: TFilters,
  predicate: (item: TItem, filters: TFilters) => boolean,
) {
  const [filters, setFilters] = useState<TFilters>(initialFilters);

  const filteredItems = useMemo(
    () => items.filter((item) => predicate(item, filters)),
    [items, filters, predicate],
  );

  function patchFilter<K extends keyof TFilters>(key: K, value: TFilters[K]) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  const hasFilters = Object.values(filters).some((value) => value.trim());

  return {
    filters,
    setFilters,
    patchFilter,
    resetFilters,
    filteredItems,
    hasFilters,
  };
}
