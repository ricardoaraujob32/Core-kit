// web/src/features/tenant-admin/usuarios/hooks/useUsuariosPermissions.ts

import { useMemo } from "react";
import { canAccessUsuariosModule, canCreateUsuario, canEditUsuario, canRunUsuarioAction, type UsuarioAction } from "../../../../core/api/permissions";
import { useAuth } from "../../../../core/auth/useAuth";
import { isSuperAdmin } from "../../../../core/auth/tipos";
import { StatusUsuario } from "../tipos";

/**
 * 
 * @returns 
 */
export function useUsuariosPermissions() {
  const { user } = useAuth();

  const isAdminLocatario = useMemo(() => {
    if (!user) return false;
    return (
      !!user.locatarioId &&
      Array.isArray(user.papeis) &&
      user.papeis.includes("ADMIN")
    );
  }, [user]);

  const canUseCrud = isSuperAdmin(user) || isAdminLocatario;

  return {
    canList: canUseCrud,
    canCreate: canUseCrud,
    canEdit: canUseCrud,
    canAction: () => canUseCrud,
  };
}
