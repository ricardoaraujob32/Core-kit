// packages/core/src/transacoes/portasRepositorio.ts
// Finalidade: Porta (contrato) do repositório de transações.

import type { LocatarioId } from "../locatario";
import type { Transacao, TransacaoId } from "./tipos";

export type RepositorioTransacoes = {
  criar(transacao: Omit<Transacao, "id">): Promise<Transacao>;
  obterPorId(locatarioId: LocatarioId, id: TransacaoId): Promise<Transacao | null>;
  listar(locatarioId: LocatarioId): Promise<Transacao[]>;
};
