import { wrapOk } from "../../result";
import type {
  ResultadoSessao,
  RotacionarRefreshInput,
  Sessao,
} from "../tipos";
import type {
  EventosSegurancaPorta,
  IdPorta,
  JwtPorta,
  RelogioPorta,
  TokensServicePorta,
} from "../portasRepositorio";
import { validarLocatarioId, validarTokenNaoVazio } from "../validadores";

export function criarRotacionarRefresh(deps: {
  tokens: TokensServicePorta;
  jwt: JwtPorta;
  relogio: RelogioPorta;
  ids: IdPorta;
  eventos?: EventosSegurancaPorta;
  ttlAccessSegundos?: number;
  ttlRefreshMs?: number;
  issuer?: string;
}) {
  return async function rotacionarRefresh(
    input: RotacionarRefreshInput
  ): ResultadoSessao {
    const loc = validarLocatarioId(input.locatarioId);
    if (!loc.ok) return Promise.resolve(loc);

    const refresh = validarTokenNaoVazio(input.refreshToken);
    if (!refresh.ok) return Promise.resolve(refresh);

    const agora = deps.relogio.agora();

    const refreshValidoRes = await deps.tokens.validarRefresh({
      locatarioId: input.locatarioId,
      tokenBruto: input.refreshToken,
      agora,
    });
    if (!refreshValidoRes.ok) return refreshValidoRes;

    const sessionId = deps.ids.gerarId();

    const accessRes = await deps.jwt.emitirAccessToken({
      usuarioId: refreshValidoRes.value.usuarioId,
      locatarioId: input.locatarioId,
      sessionId,
      agora,
      ttlSegundos: deps.ttlAccessSegundos ?? 600,
      issuer: deps.issuer ?? "mini-saas-auth",
    });
    if (!accessRes.ok) return accessRes;

    const novoRefreshRes = await deps.tokens.criarRefresh({
      locatarioId: input.locatarioId,
      usuarioId: refreshValidoRes.value.usuarioId,
      agora,
      ttlMs: deps.ttlRefreshMs ?? 1000 * 60 * 60 * 24 * 14,
    });
    if (!novoRefreshRes.ok) return novoRefreshRes;

    const revogarRes = await deps.tokens.revogar({
      locatarioId: input.locatarioId,
      tokenId: refreshValidoRes.value.tokenId,
      usuarioId: refreshValidoRes.value.usuarioId,
      agora,
      motivo: "rotacao_refresh",
    });
    if (!revogarRes.ok) return revogarRes;

    await deps.eventos?.registrarEvento?.({
      tipo: "auth.refresh",
      usuarioId: refreshValidoRes.value.usuarioId,
      locatarioId: input.locatarioId,
      detalhes: {
        tokenIdAntigo: refreshValidoRes.value.tokenId,
        sessionId,
      },
      quando: agora,
    });

    const sessao: Sessao = {
      accessToken: accessRes.value.token,
      refreshToken: novoRefreshRes.value.tokenBruto,
      accessExpiraEm: new Date(accessRes.value.payload.exp * 1000),
      refreshExpiraEm: novoRefreshRes.value.expiraEm,
    };

    return wrapOk(sessao);
  };
}