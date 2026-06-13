// apps/web/src/shared/layout/AppFooter.tsx

import type { JSX } from "react";

type AppFooterProps = {
  variant: "tenant" | "plataforma";
};

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.9.0";
const APP_ENV = import.meta.env.VITE_APP_ENV ?? "Beta";

export function AppFooter({ variant }: AppFooterProps): JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 text-sm text-slate-500 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-slate-900">Core-kit</strong>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {APP_ENV}
            </span>
            <span className="text-slate-300">•</span>
            <span>v{APP_VERSION}</span>
          </div>

          <p className="mt-1">
            {variant === "plataforma"
              ? "Administração da plataforma multi-locatário."
              : "Sistema de gestão para vendas, compras, produtos e clientes."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          <span>Suporte em preparação</span>
          <span className="text-slate-300">•</span>
          <span>Documentação em preparação</span>
          <span className="text-slate-300">•</span>
          <span>Publicado na Vercel</span>
        </div>
      </div>
    </footer>
  );
}
