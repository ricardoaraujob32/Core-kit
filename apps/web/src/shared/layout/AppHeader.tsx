// apps/web/src/shared/layout/AppHeader.tsx

import type { JSX } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../core/auth/useAuth";
import { useTenant } from "../../core/tenant/useTenant";

export type AppNavItem = {
  label: string;
  to: string;
  end?: boolean;
};

type AppHeaderProps = {
  variant: "tenant" | "plataforma";
  navItems: AppNavItem[];
};

const APP_ENV = import.meta.env.VITE_APP_ENV ?? "Beta";

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    "rounded-xl px-3 py-2 text-sm transition",
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");
}

function userLabel(user: ReturnType<typeof useAuth>["user"]): string {
  return (
    user?.nome?.trim() ||
    user?.email?.trim() ||
    user?.usuarioId?.slice(0, 8) ||
    "Usuário autenticado"
  );
}

export function AppHeader({ variant, navItems }: AppHeaderProps): JSX.Element {
  const { user, logout } = useAuth();
  const { branding } = useTenant();

  const title =
    variant === "plataforma"
      ? "Core-kit Plataforma"
      : branding?.nomeFantasia?.trim() || "Core-kit";

  const subtitle =
    variant === "plataforma"
      ? "Gestão global do SaaS"
      : "Área administrativa do locatário";

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex items-center gap-3">
          {variant === "tenant" && branding?.logoUrl ? (
            <img
              alt={title}
              className="h-10 w-10 rounded-xl border object-cover"
              src={branding.logoUrl}
            />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-xl border bg-slate-900 text-sm font-semibold text-white">
              CK
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-base font-semibold text-slate-900">
                {title}
              </strong>

              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {APP_ENV}
              </span>
            </div>

            <div className="text-xs text-slate-500">{subtitle}</div>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={navLinkClass}
              end={item.end}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
          <div className="text-sm text-slate-600">
            <span className="block text-xs text-slate-400">Sessão</span>
            <span>{userLabel(user)}</span>
          </div>

          <button
            className="rounded-xl border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={() => void handleLogout()}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
