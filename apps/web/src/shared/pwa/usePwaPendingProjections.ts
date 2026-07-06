// apps/web/src/shared/pwa/usePwaPendingProjections.ts

import { useMemo } from "react";
import {
  isQueueItemVisibleAsPending,
  projectClienteFromQueue,
  projectFornecedorFromQueue,
  projectOrdemServicoFromQueue,
  projectProdutoServicoFromQueue,
  projectTransacaoFromQueue,
} from "./pwaPendingProjections";
import { useScopedOfflineQueueView } from "./useScopedOfflineQueueView";

export function usePwaPendingProjections() {
  const queue = useScopedOfflineQueueView();

  const visibleItems = useMemo(
    () => queue.items.filter(isQueueItemVisibleAsPending),
    [queue.items],
  );

  const clientes = useMemo(
    () => visibleItems.map(projectClienteFromQueue).filter(Boolean),
    [visibleItems],
  );

  const fornecedores = useMemo(
    () => visibleItems.map(projectFornecedorFromQueue).filter(Boolean),
    [visibleItems],
  );

  const servicos = useMemo(
    () => visibleItems.map(projectProdutoServicoFromQueue).filter(Boolean),
    [visibleItems],
  );

  const produtos = useMemo(
    () => visibleItems.map(projectProdutoServicoFromQueue).filter(Boolean),
    [visibleItems],
  );

  const transacoes = useMemo(
    () => visibleItems.map(projectTransacaoFromQueue).filter(Boolean),
    [visibleItems],
  );

  const ordensServico = useMemo(
    () => visibleItems.map(projectOrdemServicoFromQueue).filter(Boolean),
    [visibleItems],
  );

  return {
    queue,
    clientes,
    fornecedores,
    produtos,
    servicos,
    transacoes,
    ordensServico,
  };
}
