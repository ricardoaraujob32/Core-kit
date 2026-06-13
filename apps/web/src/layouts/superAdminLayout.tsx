// apps/web/src/layouts/superAdminLayout.tsx

import type { JSX } from "react";
import { Outlet } from "react-router-dom";
import { AppShell, type AppNavItem } from "../shared/layout";

const PLATAFORMA_NAV_ITEMS: AppNavItem[] = [
  { label: "Dashboard", to: "/plataforma", end: true, icon: "📊" },
  { label: "Locatários", to: "/plataforma/locatarios", icon: "🏬" },
];

export default function SuperAdminLayout(): JSX.Element {
  return (
    <AppShell navItems={PLATAFORMA_NAV_ITEMS} variant="plataforma">
      <Outlet />
    </AppShell>
  );
}
