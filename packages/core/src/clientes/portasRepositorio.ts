// packages/core/src/clientes/portasRepositorio.ts
// Finalidade: Porta (contrato) do repositório de clientes.

import type { LocatarioId } from "../locatario";
import type { Cliente, ClienteId, NovoCliente } from "./tipos";

export type RepositorioClientes = {
  obterPorId(locatarioId: LocatarioId, id: ClienteId): Promise<Cliente | null>;
  obterPorNome(locatarioId: LocatarioId, nome: string): Promise<Cliente | null>;
  listar(locatarioId: LocatarioId): Promise<Cliente[]>;
  criar(dados: NovoCliente): Promise<Cliente>;
};
