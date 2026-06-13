// apps/web/src/shared/layout/AppHeader.tsx

import type { JSX } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../core/auth/useAuth";
import { useTenant } from "../../core/tenant/useTenant";

export type AppNavItem = {
  label: string;
  to: string;
  end?: boolean;
  icon?: string;
};

type AppHeaderProps = {
  variant: "tenant" | "plataforma";
  navItems: AppNavItem[];
};

const APP_ENV = import.meta.env.VITE_APP_ENV ?? "Beta";

function userLabel(user: ReturnType<typeof useAuth>["user"]): string {
  return (
    user?.nome?.trim() ||
    user?.email?.trim() ||
    user?.usuarioId?.slice(0, 8) ||
    "Usuário"
  );
}

function userInitial(user: ReturnType<typeof useAuth>["user"]): string {
  const label = userLabel(user).trim();
  return label.charAt(0).toUpperCase() || "U";
}

export function AppHeader({ variant, navItems }: AppHeaderProps): JSX.Element {
  const { user, logout } = useAuth();
  const { branding } = useTenant();

  const isPlataforma = variant === "plataforma";

  const title = isPlataforma
    ? "Core-kit Plataforma"
    : branding?.nomeFantasia?.trim() || "Core-kit";

  const subtitle = isPlataforma
    ? "Painel de administração do SaaS"
    : "Painel operacional do locatário";

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="ck-header">
      <div className="ck-header-inner">
        <div className="ck-brand">
          {variant === "tenant" && branding?.logoUrl ? (
            <img alt={title} className="ck-brand-logo" src={branding.logoUrl} />
          ) : (
            <div className="ck-brand-mark">CK</div>
          )}

          <div>
            <div className="ck-brand-title-row">
              <strong className="ck-brand-title">{title}</strong>
              <span className="ck-beta-badge">{APP_ENV}</span>
            </div>

            <p className="ck-brand-subtitle">{subtitle}</p>
          </div>
        </div>

        <div className="ck-header-actions">
          <div className="ck-search-pill">⌕ Busca global em breve</div>

          <div className="ck-user-card">
            <div className="ck-user-avatar">{userInitial(user)}</div>

            <div className="ck-user-meta">
              <div className="ck-user-name">{userLabel(user)}</div>
              <div className="ck-user-role">
                {isPlataforma ? "Plataforma" : "Locatário"}
              </div>
            </div>

            <button
              className="ck-logout-button"
              type="button"
              onClick={() => void handleLogout()}
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <nav className="ck-mobile-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            className="ck-mobile-nav-link"
            end={item.end}
            to={item.to}
          >
            <span>{item.icon ?? "•"}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
