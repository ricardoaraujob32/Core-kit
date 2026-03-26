// packages/core/src/tokens/maquinaEstados.ts

import { transicionarEstado, type TabelaTransicoes } from "../kernel";
import { tokenExpirado, tokenRevogado } from "./erros";
import type { EventoToken, StatusToken, TokenId, TokenPersistido } from "./tipos";

/**
 * Tabela formal de transições permitidas para o ciclo de vida lógico de tokens.
 *
 * Observações:
 * - `ATIVO` pode ser revogado explicitamente;
 * - `ATIVO` pode ser rotacionado, o que implica revogação lógica do token anterior;
 * - `REVOGADO` é terminal;
 * - `EXPIRADO` é terminal.
 */
const TRANSICOES_TOKEN: TabelaTransicoes<StatusToken, EventoToken> = {
  ATIVO: {
    REVOGAR: "REVOGADO",
    ROTACIONAR: "REVOGADO",
  },
  REVOGADO: {},
  EXPIRADO: {},
};

/**
 * Resolve a transição de estado lógico de um token.
 *
 * Este helper:
 * - usa a máquina de estados genérica do kernel;
 * - converte transição inválida em erro semântico do módulo `tokens`;
 * - diferencia invalidade por token revogado de invalidade por token expirado.
 *
 * @param params Dados da transição solicitada.
 * @returns `Ok(proximoStatus)` quando a transição é permitida,
 *          ou `Err(ErroApp)` quando é inválida.
 */
export function transicionarEstadoToken(params: {
  tokenId: TokenId;
  statusAtual: StatusToken;
  evento: EventoToken;
}) {
  return transicionarEstado({
    tabela: TRANSICOES_TOKEN,
    estadoAtual: params.statusAtual,
    evento: params.evento,
    contexto: { tokenId: params.tokenId },
    onTransicaoInvalida: ({ estadoAtual, contexto }) => {
      if (estadoAtual === "REVOGADO") {
        return tokenRevogado(contexto?.tokenId ?? params.tokenId);
      }

      return tokenExpirado(contexto?.tokenId ?? params.tokenId);
    },
  });
}

/**
 * Deriva o estado lógico atual de um token persistido.
 *
 * Regras:
 * - se `revogadoEm` estiver preenchido, o token está `REVOGADO`;
 * - se `expiraEm` já passou em relação a `agora`, o token está `EXPIRADO`;
 * - caso contrário, o token está `ATIVO`.
 *
 * @param token Token persistido já materializado.
 * @param agora Instante de referência para cálculo do estado.
 * @returns Estado lógico derivado do token.
 */
export function obterStatusToken(
  token: TokenPersistido,
  agora: Date,
): StatusToken {
  if (token.revogadoEm) return "REVOGADO";
  if (token.expiraEm.getTime() <= agora.getTime()) return "EXPIRADO";
  return "ATIVO";
}
