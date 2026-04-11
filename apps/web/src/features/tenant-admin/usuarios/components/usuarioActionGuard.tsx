// web/src/features/tenant-admin/usuarios/components/usuarioActionGuard.tsx

import type { ReactNode } from "react";
import type { StatusUsuario } from "../tipos";
import { useUsuariosPermissions } from "../hooks/useUsuariosPermissions";

type Props = {
  action: "listar" | "ver" | "criar" | "editar" | "inativar" | "reativar";
  statusAtual?: StatusUsuario;
  fallback?: ReactNode;
  children: ReactNode;
};

export function UsuarioActionGuard({
  action,
  statusAtual,
  fallback = null,
  children,
}: Props) {
  const permissions = useUsuariosPermissions();

  if (!permissions.canAction()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
