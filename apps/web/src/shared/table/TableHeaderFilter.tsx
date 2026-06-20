// apps/web/src/shared/table/TableHeaderFilter.tsx

import type { JSX } from "react";

type TableHeaderFilterProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function TableHeaderFilter({
  label,
  value,
  placeholder = "Filtrar",
  onChange,
}: TableHeaderFilterProps): JSX.Element {
  return (
    <div className="ck-table-header-filter">
      <span className="ck-table-header-filter__label">{label}</span>

      <input
        className="ck-table-header-filter__input"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
