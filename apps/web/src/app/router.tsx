// frontend/src/app/router.tsx

import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "../core/routing/protectedRoute";
import SuperAdminRoute from "../core/routing/superAdminRoute";
import TenantRoute from "../core/routing/tenantRoute";

import AuthLayout from "../layouts/authLayout";
import SuperAdminLayout from "../layouts/superAdminLayout";
import TenantLayout from "../layouts/tenantLayout";

import LoginPage from "../features/auth/pages/loginPage";
import SuperAdminDashboard from "../features/superadmin/pages/dashboard";
import TenantAdminDashboard from "../features/tenant-admin/pages/dashboard";

import AccessDenied from "../pages/accessDenied";
import NotFound from "../pages/notFound";
import { EditarUsuarioPage, NovoUsuarioPage, UsuarioDetailsPage, UsuariosListPage } from "../features/tenant-admin/usuarios";

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
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);