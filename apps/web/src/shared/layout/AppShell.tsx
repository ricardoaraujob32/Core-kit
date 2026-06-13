// apps/web/src/shared/layout/AppShell.tsx

import type { JSX, PropsWithChildren } from "react";
import { AppBreadcrumb } from "./AppBreadcrumb";
import { AppFooter } from "./AppFooter";
import { AppHeader, type AppNavItem } from "./AppHeader";

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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader navItems={navItems} variant={variant} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <div className="mb-4">
          <AppBreadcrumb variant={variant} />
        </div>

        {children}
      </main>

      <AppFooter variant={variant} />
    </div>
  );
}
