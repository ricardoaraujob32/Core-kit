// packages/core/src/locatarios/maquinaEstados.ts

import { ErroApp, Result, transicionarEstado, wrapOk, type TabelaTransicoes } from "../kernel";
import { locatarioEncerrado, locatarioSuspenso } from "./erros";
import type { EventoLocatario, Locatario, LocatarioId, LocatarioStatus } from "./tipos";

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
 * @param params 
 * @returns 
 */
export function transicionarEstadoLocatario(params: {
  locatarioId: LocatarioId;
  statusAtual: LocatarioStatus;
  evento: EventoLocatario;
}): Result<LocatarioStatus, ErroApp> {
  return transicionarEstado({
    tabela: TRANSICOES_LOCATARIO,
    estadoAtual: params.statusAtual,
    evento: params.evento,
    contexto: { locatarioId: params.locatarioId },
    onTransicaoInvalida: ({ estadoAtual }) =>
      erroTransicaoInvalida({
        locatarioId: params.locatarioId,
        estadoAtual,
      }),
  });
}

/**
 * 
 * @param params 
 * @returns 
 */
function erroTransicaoInvalida(params: {
  locatarioId: LocatarioId;
  estadoAtual: LocatarioStatus;
}) {
  if (params.estadoAtual === "SUSPENSO") {
    return locatarioSuspenso(params.locatarioId);
  }

  return locatarioEncerrado(params.locatarioId);
}

/**
 * 
 * @param locatario 
 * @returns 
 */
export function exigirEstadoOperacionalLocatario(locatario: Locatario): Result<Locatario, ErroApp> {
  const transicao = transicionarEstadoLocatario({
    locatarioId: locatario.locatarioId,
    statusAtual: locatario.status,
    evento: "OPERAR",
  });
  if (!transicao.ok) return transicao;

  return wrapOk(locatario);
}
