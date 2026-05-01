// apps/web/src/features/tenant-admin/clientes/hooks/useClientes.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { clientesApi } from "../api/clientesApi";
import type { Cliente } from "../tipos";

function filtrarClientes(clientes: Cliente[], busca: string): Cliente[] {
  const termo = busca.trim().toLowerCase();

  if (!termo) return clientes;

  return clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(termo) ||
    cliente.documento?.toLowerCase().includes(termo) ||
    cliente.email?.toLowerCase().includes(termo),
  );
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setIsLoading(true);
    setErro(null);

    try {
      const response = await clientesApi.listar();
      setClientes(response.itens);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const clientesFiltrados = useMemo(
    () => filtrarClientes(clientes, busca),
    [clientes, busca],
  );

  return {
    clientes,
    clientesFiltrados,
    busca,
    setBusca,
    isLoading,
    erro,
    recarregar: carregar,
  };
}