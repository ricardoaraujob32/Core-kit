// packages/core/src/auth/usecases/validarSessao.ts

import { wrapOk } from "../../kernel";
import { sessaoInvalida } from "../erros";
import { JwtAuthPorta } from "../portasServico";
import { ResultadoValidarSessao, SessaoValidada, ValidarSessaoInput } from "../tipos";
import { validarTokenNaoVazio } from "../validadores";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnValidarSessao(deps: {
  jwtPorta: JwtAuthPorta;
}) {
  return function validarSessao(input: ValidarSessaoInput): ResultadoValidarSessao {
    const token = validarTokenNaoVazio(input.accessToken);
    if (!token.ok) return token;

    const payloadRes = deps.jwtPorta.validarAccessToken(token.value);
    if (!payloadRes.ok) return sessaoInvalida();

    const payload = payloadRes.value;

    const sessao: SessaoValidada = {
      usuarioId: payload.sub,
      locatarioId: payload.loc,
      sessionId: payload.session,
      expiraEm: new Date(payload.exp * 1000),
    };

    return wrapOk(sessao);
  };
}
