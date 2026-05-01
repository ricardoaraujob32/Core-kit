// apps/web/src/features/tenant-admin/fornecedores/hooks/useFornecedores.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { fornecedoresApi } from "../api/fornecedoresApi";
import type { Fornecedor } from "../tipos";

function filtrarFornecedores(fornecedores: Fornecedor[], busca: string): Fornecedor[] {
  const termo = busca.trim().toLowerCase();

  if (!termo) return fornecedores;

  return fornecedores.filter((fornecedor) =>
    fornecedor.nome.toLowerCase().includes(termo) ||
    fornecedor.documento?.toLowerCase().includes(termo) ||
    fornecedor.email?.toLowerCase().includes(termo),
  );
}

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [busca, setBusca] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setIsLoading(true);
    setErro(null);

    try {
      const response = await fornecedoresApi.listar();
      setFornecedores(response.itens);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const fornecedoresFiltrados = useMemo(
    () => filtrarFornecedores(fornecedores, busca),
    [fornecedores, busca],
  );

  return {
    fornecedores,
    fornecedoresFiltrados,
    busca,
    setBusca,
    isLoading,
    erro,
    recarregar: carregar,
  };
}