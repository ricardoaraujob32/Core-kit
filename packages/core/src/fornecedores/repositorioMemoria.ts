/**
 * Arquivo: packages/core/src/fornecedores/repositorioMemoria.ts
 * Finalidade: Implementação em memória de RepositorioFornecedores (testes/dev).
 */

import type { RepositorioFornecedores } from "./portasRepositorio";
import type { Fornecedor, FornecedorId, NovoFornecedor } from "./tipos";

export function criarRepositorioFornecedoresEmMemoria(): RepositorioFornecedores {
  const registros: Fornecedor[] = [];
  let sequencia = 1;

  function novoId(): FornecedorId {
    return `for_${sequencia++}`;
  }

  return {
    async obterPorId(locatarioId, id) {
      return registros.find((r) => r.locatarioId === locatarioId && r.id === id) ?? null;
    },

    async obterPorNome(locatarioId, nome) {
      return registros.find((r) => r.locatarioId === locatarioId && r.nome === nome) ?? null;
    },

    async listar(locatarioId) {
      return registros.filter((r) => r.locatarioId === locatarioId);
    },

    async criar(dados: NovoFornecedor) {
      const now = new Date();
      const fornecedor: Fornecedor = {
        id: novoId(),
        locatarioId: dados.locatarioId,
        nome: dados.nome,
        email: dados.email,
        status: "ATIVO",
        criadoEm: now,
        atualizadoEm: now,
      };
      registros.push(fornecedor);
      return fornecedor;
    },
  };
}
