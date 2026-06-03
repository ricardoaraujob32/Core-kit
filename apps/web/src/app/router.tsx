// apps/web/src/app/router.tsx

import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "../core/routing/protectedRoute";
import SuperAdminRoute from "../core/routing/superAdminRoute";
import TenantRoute from "../core/routing/tenantRoute";

import AuthLayout from "../layouts/authLayout";
import SuperAdminLayout from "../layouts/superAdminLayout";
import TenantLayout from "../layouts/tenantLayout";

import LoginPage from "../features/auth/pages/LoginPage";
import SuperAdminDashboard from "../features/superadmin/pages/dashboard";
import TenantAdminDashboard from "../features/tenant-admin/pages/dashboard";

import AccessDenied from "../pages/accessDenied";
import NotFound from "../pages/notFound";
import { EditarUsuarioPage, MinhaSenhaPage, NovoUsuarioPage, UsuarioDetailsPage, UsuariosListPage } from "../features/tenant-admin/usuarios";
import { ConfiguracoesLocatarioPage, MeuLocatarioPage } from "../features/tenant-admin/locatario";
import { AssinaturaModulosPage } from "../features/tenant-admin/assinatura";
import { ClienteDetailsPage, ClientesListPage, EditarClientePage, NovoClientePage } from "../features/tenant-admin/clientes";
import { EditarFornecedorPage, FornecedorDetailsPage, FornecedoresListPage, NovoFornecedorPage } from "../features/tenant-admin/fornecedores";
import { EditarProdutoPage, NovoProdutoPage, ProdutoDetailsPage, ProdutosListPage } from "../features/tenant-admin/produtos";
import { NovaVendaPage } from "../features/tenant-admin/vendas";
import { TransacaoDetailsPage, TransacoesListPage } from "../features/tenant-admin/transacoes";
import { NovaCompraPage } from "../features/tenant-admin/compras";

/**
 * 
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/acesso-negado",
        element: <AccessDenied />,
      },
    ],
  },
  {
    element: <SuperAdminRoute />,
    children: [
      {
        path: "/superadmin",
        element: <SuperAdminLayout />,
        children: [
          {
            index: true,
            element: <SuperAdminDashboard />,
          },
        ],
      },
    ],
  },
  {
    element: <TenantRoute />,
    children: [
      {
        path: "/app",
        element: <TenantLayout />,
        children: [
          {
            index: true,
            element: <TenantAdminDashboard />,
          },
          {
            path: "usuarios",
            element: <UsuariosListPage />,
          },
          {
            path: "usuarios/novo",
            element: <NovoUsuarioPage />,
          },
          {
            path: "usuarios/:usuarioId",
            element: <UsuarioDetailsPage />,
          },
          {
            path: "usuarios/:usuarioId/editar",
            element: <EditarUsuarioPage />,
          },
          {
            path: "locatario",
            element: <MeuLocatarioPage />,
          },
          {
            path: "locatario/configuracoes",
            element: <ConfiguracoesLocatarioPage />,
          },
          {
            path: "minha-senha",
            element: <MinhaSenhaPage />,
          },
          {
            path: "assinatura/modulos",
            element: <AssinaturaModulosPage />,
          },
          {
            path: "clientes",
            element: <ClientesListPage />,
          },
          {
            path: "clientes/novo",
            element: <NovoClientePage />,
          },
          {
            path: "clientes/:clienteId",
            element: <ClienteDetailsPage />,
          },
          {
            path: "clientes/:clienteId/editar",
            element: <EditarClientePage />,
          },
          {
            path: "fornecedores",
            element: <FornecedoresListPage />,
          },
          {
            path: "fornecedores/novo",
            element: <NovoFornecedorPage />,
          },
          {
            path: "fornecedores/:fornecedorId",
            element: <FornecedorDetailsPage />,
          },
          {
            path: "fornecedores/:fornecedorId/editar",
            element: <EditarFornecedorPage />,
          },
          {
            path: "transacoes",
            element: <TransacoesListPage />,
          },
          {
            path: "transacoes/:transacaoId",
            element: <TransacaoDetailsPage />,
          },
          {
            path: "produtos",
            element: <ProdutosListPage />,
          },
          {
            path: "produtos/novo",
            element: <NovoProdutoPage />,
          },
          {
            path: "produtos/:produtoId",
            element: <ProdutoDetailsPage />,
          },
          {
            path: "produtos/:produtoId/editar",
            element: <EditarProdutoPage />,
          },
          {
            path: "vendas/nova",
            element: <NovaVendaPage />,
          },
          {
            path: "compras/nova",
            element: <NovaCompraPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);