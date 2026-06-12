// packages/core/src/tokens/maquinaEstados.ts

import { ErroApp, Result, transicionarEstado, wrapOk, type TabelaTransicoes } from "../kernel/index.js";
import { tokenExpirado, tokenRevogado } from "./erros.js";
import type { EventoToken, StatusToken, TokenId, TokenPersistido } from "./tipos.js";

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
    USAR: "ATIVO",
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
    onTransicaoInvalida: () => {
      if (params.statusAtual === "REVOGADO") {
        return tokenRevogado(params.tokenId);
      }

      return tokenExpirado(params.tokenId);
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
export function obterStatusToken(token: TokenPersistido, agora: Date): StatusToken {
  if (token.revogadoEm) return "REVOGADO";
  if (token.expiraEm.getTime() <= agora.getTime()) return "EXPIRADO";
  return "ATIVO";
}

/**
 * 
 * @param params 
 * @returns 
 */
export function exigirEstadoUtilizavelToken(params: {
  token: TokenPersistido;
  agora: Date;
}): Result<TokenPersistido, ErroApp> {
  const statusAtual = obterStatusToken(params.token, params.agora);

  const transicao = transicionarEstadoToken({
    tokenId: params.token.tokenId,
    statusAtual,
    evento: "USAR",
  });

  if (!transicao.ok) return transicao;

  return wrapOk(params.token);
}

/**
 * 
 * @param params 
 * @returns 
 */
export function exigirTransicaoToken(params: {
  token: TokenPersistido;
  agora: Date;
  evento: EventoToken;
}): Result<StatusToken, ErroApp> {
  const statusAtual = obterStatusToken(params.token, params.agora);

  return transicionarEstadoToken({
    tokenId: params.token.tokenId,
    statusAtual,
    evento: params.evento,
  });
}
