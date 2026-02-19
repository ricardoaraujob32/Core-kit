/**
 * Arquivo: packages/core/src/transacoes/repositorioMemoria.ts
 * Finalidade: Implementação em memória de RepositorioTransacoes (testes/dev).
 */

import type { LocatarioId } from "../locatario";
import type { RepositorioTransacoes } from "./portasRepositorio";
import type { Transacao, TransacaoId } from "./tipos";

export function criarRepositorioTransacoesEmMemoria(): RepositorioTransacoes {
  const registros: Transacao[] = [];
  let sequencia = 1;

  function novoId(): TransacaoId {
    return `trx_${sequencia++}`;
  }

  return {
    async criar(transacao) {
      const t: Transacao = { ...transacao, id: novoId() };
      registros.push(t);
      return t;
    },

    async obterPorId(locatarioId: LocatarioId, id: TransacaoId) {
      return registros.find((t) => t.locatarioId === locatarioId && t.id === id) ?? null;
    },

    async listar(locatarioId: LocatarioId) {
      return registros.filter((t) => t.locatarioId === locatarioId);
    },
  };
}
