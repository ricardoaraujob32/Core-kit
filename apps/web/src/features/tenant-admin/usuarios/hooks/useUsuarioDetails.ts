// apps/web/src/features/tenant-admin/usuarios/hooks/useUsuarioDetails.ts

import { useEffect, useState } from "react";
import { usuariosApi } from "../api/usuariosApi";
import type { Usuario } from "../tipos";

export function useUsuarioDetails(usuarioId?: string) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!usuarioId) {
        setErro("ID inválido");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErro(null);

      try {
        const response = await usuariosApi.obter(usuarioId);

        if (ativo) {
          setUsuario(response.item);
        }
      } catch {
        if (ativo) {
          setErro("Erro ao carregar usuário");
        }
      } finally {
        if (ativo) {
          setIsLoading(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  return {
    usuario,
    isLoading,
    erro,
  };
}