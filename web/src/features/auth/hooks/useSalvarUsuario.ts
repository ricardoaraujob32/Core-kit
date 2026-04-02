
import { useState } from "react";
import { usuariosApi } from "../api/usuariosApi";
import type { AtualizarUsuarioInput, CriarUsuarioInput, UsuarioFormMode } from "../types";

type Params = {
  mode: UsuarioFormMode;
  usuarioId?: string;
  onSuccess?: () => void | Promise<void>;
};

export function useSalvarUsuario({ mode, usuarioId, onSuccess }: Params) {
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(input: CriarUsuarioInput | AtualizarUsuarioInput) {
    setIsSaving(true);
    setErro(null);

    try {
      if (mode === "create") {
        await usuariosApi.criar(input as CriarUsuarioInput);
      } else {
        if (!usuarioId) {
          throw new Error("usuarioId ausente para edição.");
        }
        await usuariosApi.atualizar(usuarioId, input as AtualizarUsuarioInput);
      }

      await onSuccess?.();
      return true;
    } catch {
      setErro("Não foi possível salvar o usuário.");
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
