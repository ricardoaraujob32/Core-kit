import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SuperAdminDashboardPage } from "../features/superadmin/pages/DashboardPage";
import { TenantAdminDashboardPage } from "../features/tenant-admin/pages/DashboardPage";
import { AuthLayout } from "../layouts/AuthLayout";
import { SuperAdminLayout } from "../layouts/SuperAdminLayout";
import { TenantLayout } from "../layouts/TenantLayout";
import { AccessDeniedPage } from "../pages/AccessDenied";
import { NotFoundPage } from "../pages/NotFound";
import { SuperAdminRoute } from "../core/routing/SuperAdminRoute";
import { TenantAdminRoute } from "../core/routing/TenantAdminRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
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
            element: <SuperAdminDashboardPage />,
          },
        ],
      },
    ],
  },
  {
    element: <TenantAdminRoute />,
    children: [
      {
        path: "/app",
        element: <TenantLayout />,
        children: [
          {
            index: true,
            element: <TenantAdminDashboardPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/acesso-negado",
    element: <AccessDeniedPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);