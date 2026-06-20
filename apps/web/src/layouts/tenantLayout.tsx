// apps/web/src/layouts/tenantLayout.tsx

import type { JSX } from "react";
import { Outlet } from "react-router-dom";
import { TenantSidebar } from "../shared/layout";
import { TenantBreadcrumbRail } from "../shared/navigation";
import { AppNavItem } from "../shared/layout/AppHeader";

export default function TenantLayout(): JSX.Element {
  return (
    <div className="ck-tenant-layout">
      <TenantSidebar />

      <div className="ck-tenant-layout__content">
        <TenantBreadcrumbRail />

        <main className="ck-tenant-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
