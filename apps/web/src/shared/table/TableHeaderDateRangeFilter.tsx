// apps/web/src/shared/table/TableHeaderDateRangeFilter.tsx

import type { JSX } from "react";
import type { DateRangeFilterValue } from "./useTableFilters";

type Props = {
  label: string;
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
};

export function TableHeaderDateRangeFilter({
  label,
  value,
  onChange,
}: Props): JSX.Element {
  return (
    <div className="ck-table-header-filter ck-table-header-filter--date-range">
      <span className="ck-table-header-filter__label">{label}</span>

      <div className="ck-table-header-filter__range">
        <input
          className="ck-table-header-filter__input"
          type="date"
          value={value.from}
          aria-label={`${label}: data inicial`}
          onChange={(event) => onChange({ ...value, from: event.target.value })}
        />

        <input
          className="ck-table-header-filter__input"
          type="date"
          value={value.to}
          aria-label={`${label}: data final`}
          onChange={(event) => onChange({ ...value, to: event.target.value })}
        />
      </div>
    </div>
  );
}
