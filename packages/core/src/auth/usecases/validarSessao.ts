import { err, ok } from "../result"
import { erroSessaoInvalida } from "../erros"

import { wrapOk } from "../../result";
import type { ResultadoValidarSessao, SessaoValidada, ValidarSessaoInput } from "../tipos";
import type { JwtPorta } from "../portasRepositorio";
import { validarTokenNaoVazio } from "../validadores";
import { sessaoInvalida } from "../erros";

export function criarValidarSessao(deps: {
  jwt: JwtPorta;
}) {
  return function validarSessao(
    input: ValidarSessaoInput
  ): ResultadoValidarSessao {
    const token = validarTokenNaoVazio(input.token);
    if (!token.ok) return token;

    const payloadRes = deps.jwt.validarAccessToken(input.token);
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