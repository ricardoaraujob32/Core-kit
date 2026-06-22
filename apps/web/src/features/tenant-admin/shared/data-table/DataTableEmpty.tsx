// apps/web/src/features/tenant-admin/shared/data-table/DataTableEmpty.tsx

import type { JSX, ReactNode } from "react";

type DataTableEmptyProps = {
  children: ReactNode;
};

export function DataTableEmpty({ children }: DataTableEmptyProps): JSX.Element {
  return (
    <div className="ck-register-empty">
      {children}
    </div>
  );
}
