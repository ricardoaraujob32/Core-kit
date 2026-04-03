import { useMemo } from "react";
import { useAuth } from "../../../../core/auth/useAuth";
import { isSuperAdmin } from "../../../../core/auth/types";
import {
  canAccessUsuariosModule,
  canCreateUsuario,
  canEditUsuario,
  canRunUsuarioAction,
  type UsuarioAction,
} from "../../../../core/api/permissions.usuarios.exemplo";
import type { StatusUsuario } from "../types";

export function useUsuariosPermissions() {
  const auth = useAuth();

  const ctx = useMemo(
    () => ({
      permissions: auth.user?.permissoes ?? [],
      modules: auth.user?.modulosHabilitados ?? [],
      isSuperAdmin: isSuperAdmin(auth.user),
    }),
    [auth.user],
  );

  return {
    canList: canAccessUsuariosModule(ctx),
    canCreate: canCreateUsuario(ctx),
    canEdit: canEditUsuario(ctx),
    canAction: (action: UsuarioAction, statusAtual?: StatusUsuario) =>
      canRunUsuarioAction(ctx, action, statusAtual),
  };
}