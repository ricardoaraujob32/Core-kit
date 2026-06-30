// apps/web/src/features/superadmin/shared/SuperAdminSidebar.tsx

import type { JSX } from "react";
import { NavLink } from "react-router-dom";
import { SUPERADMIN_NAV_ITEMS } from "./superAdminNavigation";

export function SuperAdminSidebar(): JSX.Element {
  return (
    <aside className="ck-superadmin-sidebar">
      <header className="ck-superadmin-sidebar__header">
        <div className="ck-superadmin-sidebar__mark">CK</div>

        <div>
          <strong>Plataforma</strong>
          <span>Administração global</span>
        </div>
      </header>

      <nav className="ck-superadmin-sidebar__nav" aria-label="Menu plataforma">
        {SUPERADMIN_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `ck-superadmin-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            <span className="ck-superadmin-sidebar__icon" aria-hidden="true">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
