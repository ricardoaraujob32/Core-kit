// apps/web/src/shared/layout/AppShell.tsx

import type { JSX, PropsWithChildren } from "react";
import "./appShell.css";
import { AppBreadcrumb } from "./AppBreadcrumb";
import { AppFooter } from "./AppFooter";
import { AppHeader, type AppNavItem } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

type AppShellProps = PropsWithChildren<{
  variant: "tenant" | "plataforma";
  navItems: AppNavItem[];
}>;

export function AppShell({
  children,
  variant,
  navItems,
}: AppShellProps): JSX.Element {
  return (
    <div className="ck-shell">
      <AppHeader navItems={navItems} variant={variant} />

      <div className="ck-body">
        <AppSidebar navItems={navItems} variant={variant} />

        <main className="ck-main">
          <div className="ck-breadcrumb-wrap">
            <AppBreadcrumb variant={variant} />
          </div>

          {children}
        </main>
      </div>

      <AppFooter variant={variant} />
    </div>
  );
}
