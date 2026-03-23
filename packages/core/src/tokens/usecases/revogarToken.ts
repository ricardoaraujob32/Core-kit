// packages/core/src/tokens/usecases/revogarToken.ts

import type { RelogioPorta } from "../../kernel";
import type { RevogarTokenInput, ResultadoRevogarToken } from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { validarTokenId } from "../validadores";
import { tokenNaoEncontrado, tokenRevogado } from "../erros";

/**
 * Cria a função de caso de uso responsável por revogar um token existente.
 *
 * Este caso de uso:
 * - valida `tokenId`;
 * - consulta o token atual no repositório;
 * - falha quando o token não existe;
 * - falha quando o token já está revogado;
 * - marca `revogadoEm` com o instante atual;
 * - persiste a nova versão da entidade.
 *
 * Dependências:
 * - `tokensRepo`: consulta e persistência de tokens;
 * - `relogio`: materialização do instante de revogação.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `revogarToken` pronta para receber a entrada do caso de uso.
 */
export function createFnRevogarToken(deps: {
  tokensRepo: TokensRepositorio;
  relogio: RelogioPorta;
}) {
  /**
   * Executa o caso de uso de revogação de token.
   *
   * Fluxo:
   * 1. valida `tokenId`;
   * 2. busca o token atual;
   * 3. falha com `tokenNaoEncontrado` se não existir;
   * 4. falha com `tokenRevogado` se já estiver revogado;
   * 5. atualiza `revogadoEm` para o instante atual;
   * 6. persiste a nova versão do token.
   *
   * @param input Identificador do token a ser revogado.
   * @returns `Ok(tokenAtualizado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function revogarToken(input: RevogarTokenInput): Promise<ResultadoRevogarToken> {
    const tokenId = validarTokenId(input.tokenId);
    if (!tokenId.ok) return tokenId;

    const atual = await deps.tokensRepo.buscarPorId({
      tokenId: tokenId.value,
    });
    if (!atual.ok) return atual;

    if (!atual.value) {
      return tokenNaoEncontrado(tokenId.value);
    }

    if (atual.value.revogadoEm) {
      return tokenRevogado(tokenId.value);
    }

    return deps.tokensRepo.atualizar({
      ...atual.value,
      revogadoEm: deps.relogio.agora(),
    });
  };
}
