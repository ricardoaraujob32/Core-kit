// packages/core/src/fornecedores/portasRepositorio.ts
// Finalidade: Porta (contrato) do repositório de fornecedores.

import type { LocatarioId } from "../locatario";
import type { Fornecedor, FornecedorId, NovoFornecedor } from "./tipos";

export type RepositorioFornecedores = {
  obterPorId(locatarioId: LocatarioId, id: FornecedorId): Promise<Fornecedor | null>;
  obterPorNome(locatarioId: LocatarioId, nome: string): Promise<Fornecedor | null>;
  listar(locatarioId: LocatarioId): Promise<Fornecedor[]>;
  criar(dados: NovoFornecedor): Promise<Fornecedor>;
};
