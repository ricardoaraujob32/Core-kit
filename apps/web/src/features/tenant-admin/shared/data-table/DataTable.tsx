// apps/web/src/features/tenant-admin/shared/data-table/DataTable.tsx

import type { JSX, ReactNode } from "react";
import { DataTableEmpty } from "./DataTableEmpty";

export type DataTableColumn<TItem> = {
  key: string;
  header: ReactNode;
  render: (item: TItem) => ReactNode;
  className?: string;
};

type DataTableProps<TItem> = {
  items: TItem[];
  columns: DataTableColumn<TItem>[];
  getRowKey: (item: TItem) => string;
  emptyMessage?: ReactNode;
  className?: string;
};

export function DataTable<TItem>({
  items,
  columns,
  getRowKey,
  emptyMessage = "Nenhum registro encontrado.",
  className = "",
}: DataTableProps<TItem>): JSX.Element {
  if (items.length === 0) {
    return <DataTableEmpty>{emptyMessage}</DataTableEmpty>;
  }

  return (
    <div className="ck-register-table-panel">
      <table className={`ck-register-table ${className}`.trim()}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={getRowKey(item)}>
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
