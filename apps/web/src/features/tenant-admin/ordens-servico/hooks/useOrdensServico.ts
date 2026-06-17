import { useCallback, useEffect, useState } from "react";
import { ordensServicoApi, type ListarOrdensServicoParams } from "../api/ordensServicoApi";
import type { OrdemServico } from "../tipos";

export function useOrdensServico(params?: ListarOrdensServicoParams) {
  const [itens, setItens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const response = await ordensServicoApi.listar(params);
      setItens(response.itens);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar ordens de serviço.");
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.clienteId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return { itens, loading, erro, recarregar: carregar };
}
