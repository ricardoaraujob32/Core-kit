// apps/web/src/layouts/superAdminLayout.tsx

import type { JSX } from "react";
import { Outlet } from "react-router-dom";

export default function SuperAdminLayout(): JSX.Element {
  return (
    <div className="ck-superadmin-layout">
      <main className="ck-superadmin-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
