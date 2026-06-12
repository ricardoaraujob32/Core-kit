// packages/core/src/tokens/usecases/obterTokenPorHash.ts

import { RelogioPorta, wrapOk } from "../../kernel";
import type { ObterTokenPorHashInput, ObterTokenPorHashOutput, ObterTokenPorHashResult } from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { exigirEstadoUtilizavelToken } from "../maquinaEstados";
import { autorizarToken, PoliticaSegurancaTokensPorta } from "../politicas";
import { obterTokenObrigatorioPorHash } from "./helpers";

/**
 * Cria a função de caso de uso responsável por obter um token a partir de seu hash.
 *
 * Este caso de uso:
 * - valida o `hashToken`;
 * - consulta o repositório;
 * - falha quando o token não existe;
 * - falha quando o token já foi revogado;
 * - falha quando o token já expirou em relação ao relógio injetado;
 * - devolve a entidade apenas quando ela ainda é utilizável.
 *
 * Dependências:
 * - `tokensRepo`: fonte de consulta dos tokens persistidos;
 * - `agora`: função de relógio usada para checagem temporal.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `obterTokenPorHash` pronta para receber a entrada do caso de uso.
 */
export function createFnObterTokenPorHash(deps: {
  tokensRepo: TokensRepositorio;
  relogio: RelogioPorta;
  politicaSeguranca?: PoliticaSegurancaTokensPorta;
}) {
  /**
   * Executa o caso de uso de obtenção de token por hash.
   *
   * Fluxo:
   * 1. valida `hashToken`;
   * 2. consulta o repositório;
   * 3. falha com `tokenNaoEncontrado` quando não houver registro;
   * 4. falha com `tokenRevogado` quando o token já tiver sido revogado;
   * 5. falha com `tokenExpirado` quando o token estiver fora da validade;
   * 6. devolve o token quando ele ainda estiver válido e ativo.
   *
   * @param input Hash do token a ser consultado.
   * @returns `Ok(token)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function obterTokenPorHash(input: ObterTokenPorHashInput): ObterTokenPorHashResult {
    const token = await obterTokenObrigatorioPorHash({
      tokensRepo: deps.tokensRepo,
      locatarioId: input.locatarioId,
      usuarioId: input.usuarioId,
      hashToken: input.hashToken,
    });
    if (!token.ok) return token;

    const autorizacao = await autorizarToken(deps, {
      operacao: "TOKEN_OBTER_POR_HASH",
      locatarioId: token.value.locatarioId,
      usuarioId: token.value.usuarioId,
      tokenId: token.value.tokenId,
      token: token.value,
    });
    if (autorizacao && !autorizacao.ok) return autorizacao;

    const utilizavel = exigirEstadoUtilizavelToken({
      token: token.value,
      agora: deps.relogio.agora(),
    });
    if (!utilizavel.ok) return utilizavel;

    return wrapOk<ObterTokenPorHashOutput>({
      token: token.value,
    });
  };
}
