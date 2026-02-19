/**
 * Arquivo: packages/core/src/ordensServico/repositorioMemoria.ts
 * Finalidade: Implementação em memória de RepositorioOrdensServico (testes/dev).
 */

import type { LocatarioId } from "../locatario";
import type { RepositorioOrdensServico } from "./portasRepositorio";
import type { OrdemServico, OrdemServicoId } from "./tipos";

export function criarRepositorioOrdensServicoEmMemoria(): RepositorioOrdensServico {
  const registros: OrdemServico[] = [];
  let sequencia = 1;

  function novoId(): OrdemServicoId {
    return `os_${sequencia++}`;
  }

  return {
    async criar(dados) {
      const os: OrdemServico = { ...dados, id: novoId() };
      registros.push(os);
      return os;
    },

    async obterPorId(locatarioId: LocatarioId, id: OrdemServicoId) {
      return registros.find((o) => o.locatarioId === locatarioId && o.id === id) ?? null;
    },

    async salvar(ordem: OrdemServico) {
      const idx = registros.findIndex((o) => o.locatarioId === ordem.locatarioId && o.id === ordem.id);
      if (idx >= 0) registros[idx] = ordem;
    },

    async listar(locatarioId: LocatarioId) {
      return registros.filter((o) => o.locatarioId === locatarioId);
    },
  };
}
