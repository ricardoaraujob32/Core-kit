import { wrapOk } from "../../kernel/result";
import type {
  ResultadoValidarSessao,
  SessaoValidada,
  ValidarSessaoInput,
} from "../tipos";
import type { JwtAuthPorta } from "../portasServico";
import { validarTokenNaoVazio } from "../validadores";
import { sessaoInvalida } from "../erros";

export function criarValidarSessao(deps: {
  jwtPorta: JwtAuthPorta;
}) {
  return function validarSessao(
    input: ValidarSessaoInput,
  ): ResultadoValidarSessao {
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