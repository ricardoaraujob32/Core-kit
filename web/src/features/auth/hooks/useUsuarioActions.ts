
import { useState } from "react";
import { usuariosApi } from "../api/usuariosApi";

type Params = {
  onSuccess?: () => void | Promise<void>;
};

export function useUsuarioActions({ onSuccess }: Params = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
    } catch {
      setErro(`Não foi possível ${acao} o usuário.`);
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
