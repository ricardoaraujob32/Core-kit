/**
 * Arquivo: packages/core/src/clientes/repositorioMemoria.ts
 * Finalidade: Implementação em memória de RepositorioClientes (testes/dev).
 */

import type { RepositorioClientes } from "./portasRepositorio";
import type { Cliente, ClienteId, NovoCliente } from "./tipos";

export function criarRepositorioClientesEmMemoria(): RepositorioClientes {
  const registros: Cliente[] = [];
  let sequencia = 1;

  function novoId(): ClienteId {
    return `cli_${sequencia++}`;
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

    async criar(dados: NovoCliente) {
      const now = new Date();
      const cliente: Cliente = {
        id: novoId(),
        locatarioId: dados.locatarioId,
        nome: dados.nome,
        email: dados.email,
        status: "ATIVO",
        criadoEm: now,
        atualizadoEm: now,
      };
      registros.push(cliente);
      return cliente;
    },
  };
}
