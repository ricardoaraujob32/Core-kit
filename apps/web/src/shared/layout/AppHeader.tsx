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
    "rounded-full px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  ].join(" ");
}

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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {variant === "tenant" && branding?.logoUrl ? (
              <img
                alt={title}
                className="h-12 w-12 rounded-2xl border border-slate-200 object-cover shadow-sm"
                src={branding.logoUrl}
              />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-slate-950 to-slate-700 text-sm font-bold text-white shadow-sm">
                CK
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="truncate text-lg font-semibold text-slate-950">
                  {title}
                </strong>

                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {APP_ENV}
                </span>
              </div>

              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 lg:flex">
              Buscar em breve...
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {userInitial(user)}
              </div>

              <div className="hidden text-sm sm:block">
                <div className="max-w-40 truncate font-medium text-slate-800">
                  {userLabel(user)}
                </div>
                <div className="text-xs text-slate-500">
                  {isPlataforma ? "Plataforma" : "Locatário"}
                </div>
              </div>

              <button
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={() => void handleLogout()}
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 py-3">
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
      </div>
    </header>
  );
}
