// apps/web/src/features/tenant-admin/usuarios/hooks/useSalvarUsuario.ts

import { useState } from "react";
import { AtualizarUsuarioInput, CriarUsuarioInput, UsuarioFormMode, usuariosApi } from "..";
import { mapError } from "../../../../core/errors/mapError";

/**
 * 
 */
type Params = {
  mode: UsuarioFormMode;
  usuarioId?: string;
  onSuccess?: () => void | Promise<void>;
};

/**
 * 
 * @param param0 
 * @returns 
 */
export function useSalvarUsuario({ mode, usuarioId, onSuccess }: Params) {
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * 
   * @param input 
   * @returns 
   */
  async function salvar(input: CriarUsuarioInput | AtualizarUsuarioInput) {
    setIsSaving(true);
    setErro(null);

    try {
      if (mode === "create") {
        await usuariosApi.criar(input as CriarUsuarioInput);
      } else {
        const usuarioIdNormalizado = usuarioId?.trim();

        if (!usuarioIdNormalizado) {
          setErro("ID do usuário inválido.");
          return false;
        }

        await usuariosApi.atualizar(
          usuarioIdNormalizado,
          input as AtualizarUsuarioInput,
        );
      }

      await onSuccess?.();
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    salvar,
    isSaving,
    erro,
  };
}
