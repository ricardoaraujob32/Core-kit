// apps/web/src/shared/navigation/tenantRouteBreadcrumbs.ts

import type { DomainBreadcrumbItem } from "./DomainBreadcrumbs";

type RouteMatch = {
  pattern: RegExp;
  items: DomainBreadcrumbItem[];
};

const ROUTES: RouteMatch[] = [
  { pattern: /^\/app\/?$/, items: [{ label: "Início", to: "/app", iconKey: "inicio" }] },
  {
    pattern: /^\/app\/clientes(?:\/.*)?$/,
    items: [
      { label: "Início", to: "/app", iconKey: "inicio" },
      { label: "Clientes", to: "/app/clientes", iconKey: "clientes" },
    ],
  },
  {
    pattern: /^\/app\/fornecedores(?:\/.*)?$/,
    items: [
      { label: "Início", to: "/app", iconKey: "inicio" },
      { label: "Fornecedores", to: "/app/fornecedores", iconKey: "fornecedores" },
    ],
  },
  {
    pattern: /^\/app\/produtos(?:\/.*)?$/,
    items: [
      { label: "Início", to: "/app", iconKey: "inicio" },
      { label: "Produtos", to: "/app/produtos", iconKey: "produtos" },
    ],
  },
  {
    pattern: /^\/app\/transacoes(?:\/.*)?$/,
    items: [
      { label: "Início", to: "/app", iconKey: "inicio" },
      { label: "Transações", to: "/app/transacoes", iconKey: "transacoes" },
    ],
  },
  {
    pattern: /^\/app\/financeiro(?:\/.*)?$/,
    items: [
      { label: "Início", to: "/app", iconKey: "inicio" },
      { label: "Financeiro", to: "/app/financeiro", iconKey: "financeiro" },
    ],
  },
  {
    pattern: /^\/app\/ordens-servico(?:\/.*)?$/,
    items: [
      { label: "Início", to: "/app", iconKey: "inicio" },
      { label: "Ordens de serviço", to: "/app/ordens-servico", iconKey: "ordensServico" },
    ],
  },
  {
    pattern: /^\/app\/vendas(?:\/.*)?$/,
    items: [
      { label: "Início", to: "/app", iconKey: "inicio" },
      { label: "Vendas", to: "/app/vendas", iconKey: "vendas" },
    ],
  },
  {
    pattern: /^\/app\/compras(?:\/.*)?$/,
    items: [
      { label: "Início", to: "/app", iconKey: "inicio" },
      { label: "Compras", to: "/app/compras", iconKey: "compras" },
    ],
  },
];

function appendContextItem(pathname: string, items: DomainBreadcrumbItem[]): DomainBreadcrumbItem[] {
  if (/\/novo\/?$/.test(pathname)) return [...items, { label: "Novo", iconKey: "novo" }];
  if (/\/editar\/?$/.test(pathname)) return [...items, { label: "Editar", iconKey: "editar" }];

  const isDetailsRoute = /^\/app\/[^/]+\/[^/]+/.test(pathname) && !/\/editar\/?$/.test(pathname);
  if (isDetailsRoute) return [...items, { label: "Detalhes", iconKey: "detalhes" }];

  return items;
}

export function getTenantBreadcrumbItems(pathname: string): DomainBreadcrumbItem[] {
  const route = ROUTES.find((item) => item.pattern.test(pathname));
  return appendContextItem(pathname, route?.items ?? [{ label: "Início", to: "/app", iconKey: "inicio" }]);
}
