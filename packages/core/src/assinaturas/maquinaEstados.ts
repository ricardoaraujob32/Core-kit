// packages/core/src/assinaturas/maquinaEstados.ts

import { TabelaTransicoes, transicionarEstado } from "../kernel/index.js";
import { erroTransicaoStatusInvalida } from "./erros.js";
import { AssinaturaId, EventoAssinatura, StatusAssinatura } from "./tipos.js";

/**
 * Tabela formal de transições permitidas para o ciclo de vida de assinaturas.
 *
 * O mapa associa:
 * - estado atual
 * - evento aplicado
 * - próximo estado permitido
 */
const TRANSICOES_ASSINATURA: TabelaTransicoes<StatusAssinatura, EventoAssinatura> = {
  RASCUNHO: {
    ATIVAR: "ATIVA",
    CANCELAR: "CANCELADA",
    ENCERRAR: "ENCERRADA",
  },
  ATIVA: {
    SUSPENDER: "SUSPENSA",
    CANCELAR: "CANCELADA",
    ENCERRAR: "ENCERRADA",
  },
  SUSPENSA: {
    ATIVAR: "ATIVA",
    CANCELAR: "CANCELADA",
    ENCERRAR: "ENCERRADA",
  },
  CANCELADA: {},
  ENCERRADA: {},
};

/**
 * Resolve a transição de estado de uma assinatura a partir do estado atual
 * e do evento solicitado.
 *
 * Em caso de transição válida, devolve o próximo estado.
 * Em caso de transição inválida, devolve erro semântico do módulo.
 */
export function transicionarEstadoAssinatura(params: {
  assinaturaId: AssinaturaId;
  statusAtual: StatusAssinatura;
  evento: EventoAssinatura;
}) {
  return transicionarEstado({
    tabela: TRANSICOES_ASSINATURA,
    estadoAtual: params.statusAtual,
    evento: params.evento,
    contexto: { assinaturaId: params.assinaturaId },
    onTransicaoInvalida: ({ estadoAtual, evento, contexto }) =>
      erroTransicaoStatusInvalida(
        contexto?.assinaturaId ?? params.assinaturaId,
        estadoAtual,
        evento,
      ),
  });
}
