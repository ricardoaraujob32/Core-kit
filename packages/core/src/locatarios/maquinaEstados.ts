// packages/core/src/locatarios/maquinaEstados.ts

import { transicionarEstado, type TabelaTransicoes } from "../kernel";
import { locatarioEncerrado, locatarioSuspenso } from "./erros";
import type { EventoLocatario, LocatarioId, LocatarioStatus } from "./tipos";

/**
 * Tabela formal de transições do ciclo de vida de locatários.
 */
const TRANSICOES_LOCATARIO: TabelaTransicoes<LocatarioStatus, EventoLocatario> = {
  ATIVO: {
    OPERAR: "ATIVO",
    SUSPENDER: "SUSPENSO",
    ENCERRAR: "ENCERRADO",
  },
  SUSPENSO: {
    REATIVAR: "ATIVO",
    ENCERRAR: "ENCERRADO",
  },
  ENCERRADO: {},
  EXCLUIDO: {},
};

/**
 * Resolve a transição de estado de um locatário.
 */
export function transicionarEstadoLocatario(params: {
  locatarioId: LocatarioId;
  statusAtual: LocatarioStatus;
  evento: EventoLocatario;
}) {
  return transicionarEstado({
    tabela: TRANSICOES_LOCATARIO,
    estadoAtual: params.statusAtual,
    evento: params.evento,
    contexto: { locatarioId: params.locatarioId },
    onTransicaoInvalida: ({ estadoAtual, contexto }) => {
      if (estadoAtual === "SUSPENSO") {
        return locatarioSuspenso(contexto?.locatarioId ?? params.locatarioId);
      }

      return locatarioEncerrado(contexto?.locatarioId ?? params.locatarioId);
    },
  });
}
