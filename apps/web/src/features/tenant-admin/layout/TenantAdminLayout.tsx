// apps/web/src/features/tenant-admin/layout/TenantAdminLayout.tsx

import type { JSX, ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { TenantBreadcrumbRail } from "../../../shared/navigation";

type TenantAdminLayoutProps = {
  children?: ReactNode;
};

/**
 * Layout principal da área tenant.
 *
 * Se o projeto já tiver um layout com header/sidebar, mantenha essa estrutura
 * e adicione apenas o <TenantBreadcrumbRail /> antes do conteúdo principal.
 */
export function TenantAdminLayout({ children }: TenantAdminLayoutProps): JSX.Element {
  return (
    <div className="ck-tenant-layout">
      <main className="ck-tenant-layout__main">
        <TenantBreadcrumbRail />

        {children ?? <Outlet />}
      </main>
    </div>
  );
}
