// apps/web/src/shared/layout/AppFooter.tsx

import type { JSX } from "react";

type AppFooterProps = {
  variant: "tenant" | "plataforma";
};

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.9.0";
const APP_ENV = import.meta.env.VITE_APP_ENV ?? "Beta";

export function AppFooter({ variant }: AppFooterProps): JSX.Element {
  return (
    <footer className="border-t bg-white px-4 py-4 text-sm text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div>
          <strong className="font-medium text-slate-700">Core-kit</strong>{" "}
          <span>{APP_ENV}</span>
          <span className="mx-2 text-slate-300">•</span>
          <span>v{APP_VERSION}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <span>
            {variant === "plataforma" ? "Área da plataforma" : "Área do locatário"}
          </span>
          <span className="text-slate-300">•</span>
          <span>Suporte e documentação em preparação</span>
        </div>
      </div>
    </footer>
  );
}
