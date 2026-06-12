// apps/web/src/features/tenant-admin/produtos/hooks/useProdutos.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { produtosApi } from "../api/produtosApi";
import type { Produto, TipoProduto } from "../tipos";

type FiltroTipoProduto = TipoProduto | "TODOS";

function filtrarProdutos(produtos: Produto[], busca: string, tipo: FiltroTipoProduto): Produto[] {
  const termo = busca.trim().toLowerCase();

  return produtos.filter((produto) => {
    const atendeBusca =
      !termo ||
      produto.nome.toLowerCase().includes(termo) ||
      produto.descricao?.toLowerCase().includes(termo);

    const atendeTipo = tipo === "TODOS" || produto.tipo === tipo;

    return atendeBusca && atendeTipo;
  });
}

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<FiltroTipoProduto>("TODOS");
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setIsLoading(true);
    setErro(null);

    try {
      const response = await produtosApi.listar();
      setProdutos(response.itens);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const produtosFiltrados = useMemo(
    () => filtrarProdutos(produtos, busca, tipo),
    [produtos, busca, tipo],
  );

  return {
    produtos,
    produtosFiltrados,
    busca,
    setBusca,
    tipo,
    setTipo,
    isLoading,
    erro,
    recarregar: carregar,
  };
}