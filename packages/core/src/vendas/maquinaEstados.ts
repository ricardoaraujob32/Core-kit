import { transicionarEstado, type TabelaTransicoes } from "../kernel/index.js";
import { transicaoTransacaoInvalida } from "./erros.js";
import type { EventoTransacaoComercial, StatusTransacaoComercial, TransacaoId } from "./tipos.js";

const TRANSICOES_TRANSACAO: TabelaTransicoes<StatusTransacaoComercial, EventoTransacaoComercial> = {
  RASCUNHO: { ABRIR: "ABERTA", CONFIRMAR: "CONFIRMADA", CANCELAR: "CANCELADA" },
  ABERTA: { CONFIRMAR: "CONFIRMADA", CANCELAR: "CANCELADA" },
  CONFIRMADA: { CONCLUIR: "CONCLUIDA", CANCELAR: "CANCELADA" },
  CONCLUIDA: {},
  CANCELADA: {},
};

export function transicionarEstadoTransacao(params: { transacaoId: TransacaoId; statusAtual: StatusTransacaoComercial; evento: EventoTransacaoComercial }) {
  return transicionarEstado({
    tabela: TRANSICOES_TRANSACAO,
    estadoAtual: params.statusAtual,
    evento: params.evento,
    contexto: { transacaoId: params.transacaoId },
    onTransicaoInvalida: ({ estadoAtual, evento }) => transicaoTransacaoInvalida(params.transacaoId, estadoAtual, evento),
  });
}
