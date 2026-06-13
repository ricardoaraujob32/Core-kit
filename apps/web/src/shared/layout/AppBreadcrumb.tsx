// apps/web/src/shared/layout/AppBreadcrumb.tsx

import type { JSX } from "react";
import { Link, useLocation } from "react-router-dom";

type AppBreadcrumbProps = {
  variant: "tenant" | "plataforma";
};

const LABELS: Record<string, string> = {
  app: "Início",
  plataforma: "Plataforma",
  usuarios: "Usuários",
  locatario: "Locatário",
  locatarios: "Locatários",
  configuracoes: "Configurações",
  assinatura: "Assinatura",
  modulos: "Módulos",
  clientes: "Clientes",
  fornecedores: "Fornecedores",
  produtos: "Produtos",
  transacoes: "Transações",
  vendas: "Vendas",
  compras: "Compras",
  nova: "Nova",
  novo: "Novo",
  editar: "Editar",
  "minha-senha": "Minha senha",
};

function isLikelyId(segment: string): boolean {
  return (
    segment.length >= 16 ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i.test(segment)
  );
}

function formatSegment(segment: string): string {
  const known = LABELS[segment];

  if (known) return known;

  if (isLikelyId(segment)) {
    return `#${segment.slice(0, 8).toUpperCase()}`;
  }

  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AppBreadcrumb({ variant }: AppBreadcrumbProps): JSX.Element {
  const location = useLocation();

  const segments = location.pathname
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const rootPath = variant === "plataforma" ? "/plataforma" : "/app";

  if (segments.length <= 1) {
    return (
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <span>{variant === "plataforma" ? "Plataforma" : "Início"}</span>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        {segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label =
            index === 0
              ? variant === "plataforma"
                ? "Plataforma"
                : "Início"
              : formatSegment(segment);

          if (index === 0 && path !== rootPath) {
            return null;
          }

          return (
            <li key={`${path}-${segment}`} className="flex items-center gap-2">
              {index > 0 ? <span className="text-slate-300">/</span> : null}

              {isLast ? (
                <span className="font-medium text-slate-700">{label}</span>
              ) : (
                <Link className="hover:text-slate-900 hover:underline" to={path}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
