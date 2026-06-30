// apps/web/src/layouts/superAdminLayout.tsx

import type { JSX } from "react";
import { Outlet } from "react-router-dom";
import { SuperAdminSidebar } from "../features/superadmin/shared";
import "../features/superadmin/shared/superAdminLayout.css";

export default function SuperAdminLayout(): JSX.Element {
  return (
    <div className="ck-superadmin-layout">
      <SuperAdminSidebar />

      <main className="ck-superadmin-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
