// apps/web/src/shared/table/useTableFilters.ts

import { useMemo, useState } from "react";

export type DateRangeFilterValue = { from: string; to: string };
export type NumberRangeFilterValue = { min: string; max: string };

export type TableFilterValue =
  | string
  | DateRangeFilterValue
  | NumberRangeFilterValue
  | undefined
  | null;

export type TableFiltersState<TFilterKey extends string> = Record<TFilterKey, TableFilterValue>;

export function createDateRangeFilter(): DateRangeFilterValue {
  return { from: "", to: "" };
}

export function createNumberRangeFilter(): NumberRangeFilterValue {
  return { min: "", max: "" };
}

export function normalizeFilterText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function matchesFilter(value: unknown, filter: TableFilterValue): boolean {
  if (typeof filter !== "string") return true;
  const normalizedFilter = normalizeFilterText(filter);
  if (!normalizedFilter) return true;
  return normalizeFilterText(value).includes(normalizedFilter);
}

function normalizeDateRange(range: TableFilterValue): DateRangeFilterValue {
  if (!range || typeof range === "string" || "min" in range) return createDateRangeFilter();
  return { from: range.from ?? "", to: range.to ?? "" };
}

function normalizeNumberRange(range: TableFilterValue): NumberRangeFilterValue {
  if (!range || typeof range === "string" || "from" in range) return createNumberRangeFilter();
  return { min: range.min ?? "", max: range.max ?? "" };
}

function parseDateOnly(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function parseAnyDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function matchesDateRange(value: unknown, range: TableFilterValue): boolean {
  const normalizedRange = normalizeDateRange(range);
  if (!normalizedRange.from && !normalizedRange.to) return true;

  const date = parseAnyDate(value);
  if (!date) return false;

  const from = parseDateOnly(normalizedRange.from);
  const to = parseDateOnly(normalizedRange.to);

  if (from && date < from) return false;
  if (to && date > endOfDay(to)) return false;

  return true;
}

export function matchesNumberRange(value: unknown, range: TableFilterValue): boolean {
  const normalizedRange = normalizeNumberRange(range);
  if (!normalizedRange.min && !normalizedRange.max) return true;

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return false;

  const min = normalizedRange.min ? Number(normalizedRange.min) : null;
  const max = normalizedRange.max ? Number(normalizedRange.max) : null;

  if (min !== null && numberValue < min) return false;
  if (max !== null && numberValue > max) return false;

  return true;
}

export function useTableFilters<TItem, TFilterKey extends string>(
  items: TItem[],
  initialFilters: TableFiltersState<TFilterKey>,
  predicate: (item: TItem, filters: TableFiltersState<TFilterKey>) => boolean,
) {
  const [filters, setFilters] = useState<TableFiltersState<TFilterKey>>(initialFilters);

  const filteredItems = useMemo(
    () => items.filter((item) => predicate(item, filters)),
    [items, filters, predicate],
  );

  function setFilter(key: TFilterKey, value: TableFilterValue): void {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters(): void {
    setFilters(initialFilters);
  }

  return { filters, filteredItems, setFilter, clearFilters };
}
