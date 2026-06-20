// apps/web/src/shared/table/index.ts

export { ExpandableTableCell } from "./ExpandableTableCell";
export { ListPageHeader } from "./ListPageHeader";
export { TableHeaderFilter } from "./TableHeaderFilter";
export { TableHeaderDateRangeFilter } from "./TableHeaderDateRangeFilter";
export { TableHeaderNumberRangeFilter } from "./TableHeaderNumberRangeFilter";

export {
  createDateRangeFilter,
  createNumberRangeFilter,
  matchesDateRange,
  matchesFilter,
  matchesNumberRange,
  normalizeFilterText,
  useTableFilters,
} from "./useTableFilters";

export type {
  DateRangeFilterValue,
  NumberRangeFilterValue,
  TableFilterValue,
  TableFiltersState,
} from "./useTableFilters";
