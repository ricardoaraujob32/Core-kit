import { wrapOk } from "../../kernel/result";
import type {
  ResultadoRotacionarRefresh,
  RotacionarRefreshInput,
  Sessao,
} from "../tipos";
import type {
  EventosSegurancaPorta,
  IdPorta,
  JwtAuthPorta,
  RelogioPorta,
  TokensAuthPorta,
} from "../portasServico";
import {
  validarLocatarioIdAuth,
  validarTokenNaoVazio,
} from "../validadores";

export function criarRotacionarRefresh(deps: {
  tokensPorta: TokensAuthPorta;
  jwtPorta: JwtAuthPorta;
  relogio: RelogioPorta;
  idPorta: IdPorta;
  eventos?: EventosSegurancaPorta;
  ttlAccessSegundos?: number;
  ttlRefreshMs?: number;
  issuer?: string;
}) {
  return async function rotacionarRefresh(
    input: RotacionarRefreshInput,
  ): ResultadoRotacionarRefresh {
    const locatarioId = validarLocatarioIdAuth(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const refresh = validarTokenNaoVazio(input.refreshToken);
    if (!refresh.ok) return refresh;

    const agora = deps.relogio.agora();

    const refreshValido = await deps.tokensPorta.validarRefresh({
      locatarioId: locatarioId.value,
      tokenBruto: refresh.value,
      agora,
    });
    if (!refreshValido.ok) return refreshValido;

    const sessionId = deps.idPorta.gerarId();

    const accessRes = await deps.jwtPorta.emitirAccessToken({
      usuarioId: refreshValido.value.usuarioId,
      locatarioId: locatarioId.value,
      sessionId,
      agora,
      ttlSegundos: deps.ttlAccessSegundos ?? 600,
      issuer: deps.issuer ?? "mini-saas-auth",
    });
    if (!accessRes.ok) return accessRes;

    const novoRefresh = await deps.tokensPorta.criarRefresh({
      locatarioId: locatarioId.value,
      usuarioId: refreshValido.value.usuarioId,
      agora,
      ttlMs: deps.ttlRefreshMs ?? 1000 * 60 * 60 * 24 * 14,
    });
    if (!novoRefresh.ok) return novoRefresh;

    const revogar = await deps.tokensPorta.revogar({
      tokenId: refreshValido.value.tokenId,
      agora,
    });
    if (!revogar.ok) return revogar;

    await deps.eventos?.registrarEvento?.({
      tipo: "auth.refresh",
      usuarioId: refreshValido.value.usuarioId,
      locatarioId: locatarioId.value,
      detalhes: {
        tokenIdAntigo: refreshValido.value.tokenId,
        sessionId,
      },
      quando: agora,
    });

    const sessao: Sessao = {
      accessToken: accessRes.value.token,
      refreshToken: novoRefresh.value.tokenBruto,
      accessExpiraEm: new Date(accessRes.value.payload.exp * 1000),
      refreshExpiraEm: novoRefresh.value.expiraEm,
    };

    return wrapOk(sessao);
  };
}