// packages/core/src/auth/usecases/rotacionarRefreshPlataforma.ts

import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel/index.js";
import { EventosSegurancaPorta, JwtAuthPorta, TokensAuthPorta } from "../portasServico.js";
import { RotacionarRefreshPlataformaInput, RotacionarRefreshPlataformaOutput, RotacionarRefreshPlataformaResult, Sessao } from "../tipos.js";
import { validarTokenNaoVazio } from "../validadores.js";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnRotacionarRefreshPlataforma(deps: {
  tokensPorta: TokensAuthPorta;
  jwtPorta: JwtAuthPorta;
  relogio: RelogioPorta;
  idPorta: IdPorta;
  transacao?: TransacaoPorta;
  eventos?: EventosSegurancaPorta;
  ttlAccessSegundos?: number;
  ttlRefreshMs?: number;
  issuer?: string;
}) {
  /**
   * 
   */
  return async function rotacionarRefreshPlataforma(input: RotacionarRefreshPlataformaInput): RotacionarRefreshPlataformaResult {
    const refresh = validarTokenNaoVazio(input.refreshToken);
    if (!refresh.ok) return refresh;

    const agora = deps.relogio.agora();

    const refreshValido = await deps.tokensPorta.validarRefresh({
      locatarioId: null,
      tokenBruto: refresh.value,
      agora,
    });
    if (!refreshValido.ok) return refreshValido;

    if (refreshValido.value.chave.locatarioId !== null) {
      return {
        ok: false,
        error: {
          codigo: "NAO_AUTENTICADO",
          mensagem: "Refresh token inválido para plataforma.",
          detalhes: {
            operacao: "auth.plataforma.refresh.escopo",
          },
        },
      };
    }

    const sessionId = deps.idPorta.gerarId();

    const accessRes = await deps.jwtPorta.emitirAccessToken({
      usuarioId: refreshValido.value.chave.usuarioId,
      locatarioId: null,
      sessionId,
      agora,
      ttlSegundos: deps.ttlAccessSegundos ?? 300,
      issuer: deps.issuer ?? "mini-saas-api",
    });
    if (!accessRes.ok) return accessRes;

    const persistenciaRes = await executarEmTransacao(deps.transacao, async () => {
      const novoRefresh = await deps.tokensPorta.criarRefresh({
        locatarioId: null,
        usuarioId: refreshValido.value.chave.usuarioId,
        agora,
        ttlMs: deps.ttlRefreshMs ?? 1000 * 60 * 60,
      });
      if (!novoRefresh.ok) return novoRefresh;

      const revogar = await deps.tokensPorta.revogar({
        chave: refreshValido.value.chave,
        agora,
        proximo: novoRefresh.value.chave,
      });
      if (!revogar.ok) return revogar;

      return wrapOk(novoRefresh.value);
    });
    if (!persistenciaRes.ok) return persistenciaRes;

    await deps.eventos?.registrarEvento?.({
      tipo: "auth.refresh",
      usuarioId: refreshValido.value.chave.usuarioId,
      locatarioId: null,
      detalhes: {
        tokenIdAntigo: refreshValido.value.chave.tokenId,
        tokenIdNovo: persistenciaRes.value.chave.tokenId,
        sessionId,
        escopo: "PLATAFORMA",
      },
      quando: agora,
    });

    const sessao: Sessao = {
      accessToken: accessRes.value.token,
      refreshToken: persistenciaRes.value.tokenBruto,
      accessExpiraEm: new Date(accessRes.value.payload.exp * 1000),
      refreshExpiraEm: persistenciaRes.value.expiraEm,
    };

    return wrapOk<RotacionarRefreshPlataformaOutput>({
      sessao,
      usuarioId: refreshValido.value.chave.usuarioId,
    });
  };
}