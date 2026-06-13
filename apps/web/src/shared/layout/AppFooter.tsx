// apps/web/src/shared/layout/AppFooter.tsx

import type { JSX } from "react";

type AppFooterProps = {
  variant: "tenant" | "plataforma";
};

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.9.0";
const APP_ENV = import.meta.env.VITE_APP_ENV ?? "Beta";

export function AppFooter({ variant }: AppFooterProps): JSX.Element {
  return (
    <footer className="ck-footer">
      <div className="ck-footer-inner">
        <div>
          <div className="ck-footer-brand">
            <strong>Core-kit</strong>
            <span className="ck-beta-badge">{APP_ENV}</span>
            <span className="ck-dot">•</span>
            <span>v{APP_VERSION}</span>
          </div>

          <p className="ck-footer-desc">
            {variant === "plataforma"
              ? "Administração da plataforma multi-locatário."
              : "Sistema de gestão para vendas, compras, produtos e clientes."}
          </p>
        </div>

        <div className="ck-footer-links">
          <span>Suporte em preparação</span>
          <span className="ck-dot">•</span>
          <span>Documentação em preparação</span>
          <span className="ck-dot">•</span>
          <span>Publicado na Vercel</span>
        </div>
      </div>
    </footer>
  );
}
