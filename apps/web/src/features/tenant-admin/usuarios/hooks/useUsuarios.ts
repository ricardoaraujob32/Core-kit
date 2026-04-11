// web/src/features/tenant-admin/usuarios/hooks/useUsuarios.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiltroUsuarios, Usuario, usuariosApi } from "..";
import { mapError } from "../../../../core/errors/mapError";


/**
 * 
 * @param usuarios 
 * @param filtro 
 * @returns 
 */
function filtrarUsuarios(usuarios: Usuario[], filtro: FiltroUsuarios): Usuario[] {
  const busca = filtro.busca?.trim().toLowerCase() ?? "";
  const status = filtro.status ?? "TODOS";

  return usuarios.filter((usuario) => {
    const atendeBusca =
      busca.length === 0 ||
      usuario.nome.toLowerCase().includes(busca) ||
      usuario.email.toLowerCase().includes(busca);

    const atendeStatus = status === "TODOS" || usuario.status === status;
    return atendeBusca && atendeStatus;
  });
}

/**
 * 
 * @returns 
 */
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroUsuarios>({
    busca: "",
    status: "TODOS",
  });

  const carregar = useCallback(async () => {
    setIsLoading(true);
    setErro(null);

    try {
      const response = await usuariosApi.listar();
      setUsuarios(response.itens);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const usuariosFiltrados = useMemo(
    () => filtrarUsuarios(usuarios, filtro),
    [usuarios, filtro],
  );

  return {
    usuarios,
    usuariosFiltrados,
    isLoading,
    erro,
    filtro,
    setFiltro,
    recarregar: carregar,
  };
}
