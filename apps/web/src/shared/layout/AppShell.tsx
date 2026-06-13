// apps/web/src/shared/layout/AppShell.tsx

import type { JSX, PropsWithChildren } from "react";
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <AppHeader navItems={navItems} variant={variant} />

      <div className="mx-auto flex w-full max-w-screen-2xl flex-1">
        <AppSidebar navItems={navItems} variant={variant} />

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-6">
          <div className="mb-4">
            <AppBreadcrumb variant={variant} />
          </div>

          {children}
        </main>
      </div>

      <AppFooter variant={variant} />
    </div>
  );
}
