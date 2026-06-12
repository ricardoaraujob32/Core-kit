// packages/core/src/auth/usecases/rotacionarRefresh.ts

import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel/index.js";
import { EventosSegurancaPorta, JwtAuthPorta, TokensAuthPorta } from "../portasServico.js";
import { RotacionarRefreshResult, RotacionarRefreshInput, Sessao, RotacionarRefreshOutput } from "../tipos.js";
import { validarLocatarioIdAuth, validarTokenNaoVazio } from "../validadores.js";

/**
 * Cria o caso de uso responsável por rotacionar um refresh token
 * e emitir uma nova sessão autenticada.
 *
 * Este caso de uso:
 * - valida `locatarioId` e `refreshToken`;
 * - valida o refresh atual via `tokensPorta`;
 * - gera novo `sessionId`;
 * - emite novo access token;
 * - cria novo refresh token;
 * - revoga o refresh anterior;
 * - registra evento de segurança, quando disponível;
 * - devolve a nova sessão materializada.
 *
 * Dependências:
 * - `tokensPorta`: validação, criação e revogação de refresh token;
 * - `jwtPorta`: emissão do novo access token;
 * - `relogio`: materialização do instante da rotação;
 * - `idPorta`: geração de `sessionId`;
 * - `eventos`: registro opcional de evento de refresh;
 * - TTLs e `issuer`: parâmetros opcionais de sessão.
 *
 * @param deps Dependências externas necessárias para a execução.
 * @returns Função `rotacionarRefresh` pronta para receber a entrada do caso de uso.
 */
export function createFnRotacionarRefresh(deps: {
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
   * Executa o caso de uso de rotação de refresh.
   *
   * Fluxo:
   * 1. valida entrada;
   * 2. valida o refresh atual;
   * 3. gera `sessionId`;
   * 4. emite novo access token;
   * 5. cria novo refresh token;
   * 6. revoga o token antigo;
   * 7. registra evento de segurança;
   * 8. devolve a nova sessão.
   *
   * @param input Dados do refresh a ser rotacionado.
   * @returns `Ok(sessao)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function rotacionarRefresh(input: RotacionarRefreshInput): RotacionarRefreshResult {
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
      usuarioId: refreshValido.value.chave.usuarioId,
      locatarioId: locatarioId.value,
      sessionId,
      agora,
      ttlSegundos: deps.ttlAccessSegundos ?? 600,
      issuer: deps.issuer ?? "mini-saas-api",
    });
    if (!accessRes.ok) return accessRes;

    const persistenciaRes = await executarEmTransacao(deps.transacao, async () => {
      const novoRefresh = await deps.tokensPorta.criarRefresh({
        locatarioId: locatarioId.value,
        usuarioId: refreshValido.value.chave.usuarioId,
        agora,
        ttlMs: deps.ttlRefreshMs ?? 1000 * 60 * 60 * 24 * 14,
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
      locatarioId: locatarioId.value,
      detalhes: {
        tokenIdAntigo: refreshValido.value.chave.tokenId,
        tokenIdNovo: persistenciaRes.value.chave.tokenId,
        sessionId,
      },
      quando: agora,
    });

    const sessao: Sessao = {
      accessToken: accessRes.value.token,
      refreshToken: persistenciaRes.value.tokenBruto,
      accessExpiraEm: new Date(accessRes.value.payload.exp * 1000),
      refreshExpiraEm: persistenciaRes.value.expiraEm,
    };

    return wrapOk<RotacionarRefreshOutput>({
      sessao,
    });
  };
}
