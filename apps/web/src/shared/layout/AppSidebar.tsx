// apps/web/src/shared/layout/AppSidebar.tsx

import type { JSX } from "react";
import { NavLink } from "react-router-dom";
import type { AppNavItem } from "./AppHeader";

type AppSidebarProps = {
  variant: "tenant" | "plataforma";
  navItems: AppNavItem[];
};

export function AppSidebar({
  variant,
  navItems,
}: AppSidebarProps): JSX.Element {
  return (
    <aside className="ck-sidebar">
      <div className="ck-sidebar-panel">
        <div className="ck-sidebar-top">
          <div className="ck-sidebar-kicker">
            {variant === "plataforma" ? "Administração" : "Operação"}
          </div>

          <div className="ck-sidebar-title">
            {variant === "plataforma" ? "Plataforma" : "Módulos do sistema"}
          </div>

          <p className="ck-sidebar-desc">
            {variant === "plataforma"
              ? "Gerencie locatários, módulos e usuários da plataforma."
              : "Acesse rapidamente as áreas principais do locatário."}
          </p>
        </div>

        <nav className="ck-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className="ck-sidebar-link"
              end={item.end}
              to={item.to}
            >
              <span className="ck-sidebar-icon">{item.icon ?? "•"}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ck-sidebar-footer">
          <strong>Core-kit Beta</strong>
          <br />
          Interface em evolução para PWA, mobile e operação diária.
        </div>
      </div>
    </aside>
  );
}
