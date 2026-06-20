// apps/web/src/features/tenant-admin/layout/TenantAdminShell.tsx

import type { JSX, ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { TenantBreadcrumbRail } from "../../../shared/navigation";

type TenantAdminShellProps = {
  children?: ReactNode;
};

/**
 * Shell/layout principal da área tenant.
 *
 * O breadcrumb global deve ficar aqui, não em cada página.
 */
export function TenantAdminShell({
  children,
}: TenantAdminShellProps): JSX.Element {
  return (
    <div className="ck-tenant-shell">
      <main className="ck-tenant-shell__main">
        <TenantBreadcrumbRail />

        {children ?? <Outlet />}
      </main>
    </div>
  );
}
