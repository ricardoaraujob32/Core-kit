// packages/core/src/auth/usecases/rotacionarRefresh.ts

import { IdPorta, RelogioPorta, wrapOk } from "../../kernel";
import { EventosSegurancaPorta } from "../portasRepositorio";
import { JwtAuthPorta, TokensAuthPorta } from "../portasServico";
import { ResultadoRotacionarRefresh, RotacionarRefreshInput, Sessao } from "../tipos";
import { validarLocatarioIdAuth, validarTokenNaoVazio } from "../validadores";

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
  return async function rotacionarRefresh(input: RotacionarRefreshInput): ResultadoRotacionarRefresh {
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