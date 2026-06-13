// apps/web/src/shared/layout/AppSidebar.tsx

import type { JSX } from "react";
import { NavLink } from "react-router-dom";
import type { AppNavItem } from "./AppHeader";

type AppSidebarProps = {
  variant: "tenant" | "plataforma";
  navItems: AppNavItem[];
};

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
    isActive
      ? "bg-slate-950 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  ].join(" ");
}

export function AppSidebar({
  variant,
  navItems,
}: AppSidebarProps): JSX.Element {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/90 lg:block">
      <div className="sticky top-20 grid gap-6 p-4">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-700 p-4 text-white shadow-sm">
          <div className="text-sm font-semibold">
            {variant === "plataforma" ? "Plataforma" : "Área do locatário"}
          </div>

          <p className="mt-1 text-xs text-slate-200">
            {variant === "plataforma"
              ? "Administre locatários, módulos e usuários."
              : "Gerencie vendas, compras, produtos e clientes."}
          </p>
        </div>

        <nav className="grid gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={navLinkClass}
              end={item.end}
              to={item.to}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-base text-slate-700">
                {item.icon ?? "•"}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
