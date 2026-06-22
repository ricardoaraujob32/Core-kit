// apps/web/src/features/tenant-admin/shared/data-table/DataTableLinkButton.tsx

import type { JSX, ReactNode } from "react";
import { Link } from "react-router-dom";

type DataTableLinkButtonProps = {
  to: string;
  children: ReactNode;
};

export function DataTableLinkButton({
  to,
  children,
}: DataTableLinkButtonProps): JSX.Element {
  return (
    <Link className="ck-register-link" to={to}>
      {children}
    </Link>
  );
}
