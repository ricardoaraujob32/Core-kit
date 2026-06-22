// apps/web/src/features/tenant-admin/shared/data-table/DataTableActions.tsx

import type { JSX, ReactNode } from "react";

type DataTableActionsProps = {
  children: ReactNode;
};

export function DataTableActions({
  children,
}: DataTableActionsProps): JSX.Element {
  return (
    <div className="ck-register-row-actions">
      {children}
    </div>
  );
}
