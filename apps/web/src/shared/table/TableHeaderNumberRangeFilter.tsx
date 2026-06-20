// apps/web/src/shared/table/TableHeaderNumberRangeFilter.tsx

import type { JSX } from "react";
import type { NumberRangeFilterValue } from "./useTableFilters";

type Props = {
  label: string;
  value: NumberRangeFilterValue;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  onChange: (value: NumberRangeFilterValue) => void;
};

export function TableHeaderNumberRangeFilter({
  label,
  value,
  minPlaceholder = "Mín.",
  maxPlaceholder = "Máx.",
  onChange,
}: Props): JSX.Element {
  return (
    <div className="ck-table-header-filter ck-table-header-filter--number-range">
      <span className="ck-table-header-filter__label">{label}</span>

      <div className="ck-table-header-filter__range">
        <input
          className="ck-table-header-filter__input"
          type="number"
          inputMode="decimal"
          value={value.min}
          placeholder={minPlaceholder}
          onChange={(event) => onChange({ ...value, min: event.target.value })}
        />

        <input
          className="ck-table-header-filter__input"
          type="number"
          inputMode="decimal"
          value={value.max}
          placeholder={maxPlaceholder}
          onChange={(event) => onChange({ ...value, max: event.target.value })}
        />
      </div>
    </div>
  );
}
