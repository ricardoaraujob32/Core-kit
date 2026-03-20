// frontend/src/app/router.tsx

import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "../core/routing/ProtectedRoute";
import SuperAdminRoute from "../core/routing/SuperAdminRoute";
import TenantRoute from "../core/routing/TenantRoute";

import AuthLayout from "../layouts/AuthLayout";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import TenantLayout from "../layouts/TenantLayout";

import LoginPage from "../features/auth/pages/LoginPage";
import SuperAdminDashboard from "../features/superadmin/pages/Dashboard";
import TenantAdminDashboard from "../features/tenant-admin/pages/Dashboard";

import AccessDenied from "../pages/AccessDenied";
import NotFound from "../pages/NotFound";

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
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);