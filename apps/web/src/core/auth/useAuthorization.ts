// apps/web/src/core/auth/useAuthorization.ts

import { useMemo } from "react";
import { canAccessUsuariosModule, canCreateUsuario, canEditUsuario, hasModule, hasPermission, type FrontendAuthorizationContext } from "../api/permissions";
import { useAuth } from "./useAuth";
import { isSuperAdmin } from "./tipos";

export function useAuthorization() {
  const { user, isAuthenticated } = useAuth();

  const ctx = useMemo<FrontendAuthorizationContext>(
    () => ({
      permissions: user?.permissoes ?? [],
      modules: user?.modulosHabilitados ?? [],
      isSuperAdmin: isSuperAdmin(user),
    }),
    [user],
  );

  return {
    isAuthenticated,
    user,
    ctx,
    permissions: ctx.permissions ?? [],
    modules: ctx.modules ?? [],
    isSuperAdmin: ctx.isSuperAdmin === true,
    hasPermission: (permission: string) => hasPermission(ctx, permission),
    hasModule: (moduleCode: string) => hasModule(ctx, moduleCode),
    canAccessUsuariosModule: () => canAccessUsuariosModule(ctx),
    canCreateUsuario: () => canCreateUsuario(ctx),
    canEditUsuario: () => canEditUsuario(ctx),
  };
}