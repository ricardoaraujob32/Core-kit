// web/src/features/tenant-admin/usuarios/hooks/useUsuarioActions.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { usuariosApi } from "../api/usuariosApi";

/**
 * 
 */
type Params = {
  onSuccess?: () => void | Promise<void>;
};

/**
 * 
 * @param param0 
 * @returns 
 */
export function useUsuarioActions({ onSuccess }: Params = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * 
   * @param acao 
   * @param usuarioId 
   * @returns 
   */
  async function executar(acao: "inativar" | "reativar", usuarioId: string) {
    setIsSubmitting(true);
    setErro(null);

    try {
      if (acao === "inativar") {
        await usuariosApi.inativar(usuarioId);
      } else {
        await usuariosApi.reativar(usuarioId);
      }

      await onSuccess?.();
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    erro,
    inativar: (usuarioId: string) => executar("inativar", usuarioId),
    reativar: (usuarioId: string) => executar("reativar", usuarioId),
  };
}