// apps/web/src/shared/layout/TenantSidebar.tsx

import type { JSX } from "react";
import { NavLink } from "react-router-dom";
import { useTenantMenuCollapsed } from "./useTenantMenuCollapsed";
import {
  getTenantNavigationIcon,
  type TenantNavigationIconKey,
} from "../navigation";

type TenantMenuItem = {
  label: string;
  to: string;
  iconKey: TenantNavigationIconKey;
};

const MENU_ITEMS: TenantMenuItem[] = [
  { label: "Dashboard", to: "/app", iconKey: "dashboard" },
  { label: "Clientes", to: "/app/clientes", iconKey: "clientes" },
  { label: "Fornecedores", to: "/app/fornecedores", iconKey: "fornecedores" },
  { label: "Produtos", to: "/app/produtos", iconKey: "produtos" },
  { label: "Transações", to: "/app/transacoes", iconKey: "transacoes" },
  { label: "Financeiro", to: "/app/financeiro", iconKey: "financeiro" },
  { label: "Ordens de serviço", to: "/app/ordens-servico", iconKey: "ordensServico", },
];

export function TenantSidebar(): JSX.Element {
  const { collapsed, toggleCollapsed } = useTenantMenuCollapsed();

  return (
    <aside
      className={`ck-tenant-sidebar ${
        collapsed ? "ck-tenant-sidebar--collapsed" : ""
      }`}
    >
      <div className="ck-tenant-sidebar__header">
        <strong className="ck-tenant-sidebar__title">Módulos</strong>

        <button
          type="button"
          className="ck-tenant-sidebar__toggle"
          aria-label="Alternar menu lateral"
          title="Alternar menu lateral"
          onClick={toggleCollapsed}
        >
          ☰
        </button>
      </div>

      <nav className="ck-tenant-sidebar__nav" aria-label="Menu tenant">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/app"}
            className={({ isActive }) =>
              `ck-tenant-sidebar__link ${isActive ? "is-active" : ""}`
            }
            title={item.label}
          >
            <span className="ck-tenant-sidebar__icon" aria-hidden="true">
              {getTenantNavigationIcon(item.iconKey)}
            </span>

            <span className="ck-tenant-sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}