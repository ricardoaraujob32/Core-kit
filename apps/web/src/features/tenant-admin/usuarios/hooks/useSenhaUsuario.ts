// apps/web/src/features/tenant-admin/usuarios/hooks/useSenhaUsuario.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { usuariosApi } from "../api/usuariosApi";
import type {
  AlterarMinhaSenhaInput,
  RedefinirSenhaUsuarioInput,
} from "../tipos";

type Params = {
  usuarioId?: string;
  onSuccess?: () => void | Promise<void>;
};

export function useSenhaUsuario({ usuarioId, onSuccess }: Params) {
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function alterarMinhaSenha(input: AlterarMinhaSenhaInput) {
    const id = usuarioId?.trim();

    if (!id) {
      setErro("ID do usuário inválido.");
      return false;
    }

    setIsSaving(true);
    setErro(null);
    setSucesso(null);

    try {
      await usuariosApi.alterarMinhaSenha(id, input);
      setSucesso("Senha alterada com sucesso.");
      await onSuccess?.();
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function redefinirSenha(input: RedefinirSenhaUsuarioInput) {
    const id = usuarioId?.trim();

    if (!id) {
      setErro("ID do usuário inválido.");
      return false;
    }

    setIsSaving(true);
    setErro(null);
    setSucesso(null);

    try {
      await usuariosApi.redefinirSenha(id, input);
      setSucesso("Senha redefinida com sucesso.");
      await onSuccess?.();
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  function limparMensagens() {
    setErro(null);
    setSucesso(null);
  }

  return {
    alterarMinhaSenha,
    redefinirSenha,
    limparMensagens,
    isSaving,
    erro,
    sucesso,
  };
}