// packages/core/src/ordensServico/portasRepositorio.ts
// Finalidade: Porta (contrato) de repositório de Ordens de Serviço.

import type { LocatarioId } from "../locatario";
import type { OrdemServico, OrdemServicoId } from "./tipos";

export type RepositorioOrdensServico = {
  criar(dados: Omit<OrdemServico, "id">): Promise<OrdemServico>;
  obterPorId(locatarioId: LocatarioId, id: OrdemServicoId): Promise<OrdemServico | null>;
  salvar(ordem: OrdemServico): Promise<void>;
  listar(locatarioId: LocatarioId): Promise<OrdemServico[]>;
};
