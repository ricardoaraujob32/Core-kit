import { transicionarEstado, type TabelaTransicoes } from "../kernel/index.js";
import { ordemServicoTransicaoInvalida } from "./erros.js";
import type { EventoOrdemServico, OrdemServicoId, StatusOrdemServico } from "./tipos.js";

const TRANSICOES_OS: TabelaTransicoes<StatusOrdemServico, EventoOrdemServico> = {
  ABERTA: { INICIAR: "EM_ANDAMENTO", AGUARDAR: "AGUARDANDO", CONCLUIR: "CONCLUIDA", CANCELAR: "CANCELADA" },
  EM_ANDAMENTO: { AGUARDAR: "AGUARDANDO", CONCLUIR: "CONCLUIDA", CANCELAR: "CANCELADA" },
  AGUARDANDO: { INICIAR: "EM_ANDAMENTO", CONCLUIR: "CONCLUIDA", CANCELAR: "CANCELADA" },
  CONCLUIDA: {},
  CANCELADA: {},
};

export function transicionarEstadoOrdemServico(params: {
  ordemServicoId: OrdemServicoId;
  statusAtual: StatusOrdemServico;
  evento: EventoOrdemServico;
}) {
  return transicionarEstado({
    tabela: TRANSICOES_OS,
    estadoAtual: params.statusAtual,
    evento: params.evento,
    contexto: { ordemServicoId: params.ordemServicoId },
    onTransicaoInvalida: ({ estadoAtual, evento, contexto }) =>
      ordemServicoTransicaoInvalida(contexto?.ordemServicoId ?? params.ordemServicoId, estadoAtual, evento),
  });
}
