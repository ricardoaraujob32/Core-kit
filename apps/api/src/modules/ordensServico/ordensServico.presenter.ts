import type { OrdemServico } from "@core-kit/core";

export function toOrdemServicoDto(ordemServico: OrdemServico) {
  return {
    ordemServicoId: ordemServico.ordemServicoId,
    locatarioId: ordemServico.locatarioId,
    clienteId: ordemServico.clienteId,
    servicoId: ordemServico.servicoId ?? null,
    transacaoId: ordemServico.transacaoId ?? null,
    status: ordemServico.status,
    titulo: ordemServico.titulo,
    descricao: ordemServico.descricao,
    abertaEm: ordemServico.abertaEm.toISOString(),
    fechadaEm: ordemServico.fechadaEm?.toISOString() ?? null,
    criadoEm: ordemServico.criadoEm.toISOString(),
    atualizadoEm: ordemServico.atualizadoEm.toISOString(),
  };
}
