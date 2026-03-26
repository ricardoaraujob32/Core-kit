// packages/core/src/tokens/usecases/revogarToken.ts

import { executarEmTransacao, wrapOk, type RelogioPorta, type TransacaoPorta } from "../../kernel";
import type { RevogarTokenInput, RevogarTokenOutput, RevogarTokenResult } from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { validarAgora, validarTokenId } from "../validadores";
import { tokenNaoEncontrado, tokenRevogado } from "../erros";
import { obterStatusToken, transicionarEstadoToken } from "../maquinaEstados";
import { validarLocatarioId } from "../../locatarios";
import { validarUsuarioId } from "../../usuarios";

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
  transacao?: TransacaoPorta;
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
  return async function revogarToken(input: RevogarTokenInput): RevogarTokenResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const tokenId = validarTokenId(input.tokenId);
    if (!tokenId.ok) return tokenId;

    const agora = validarAgora(input.agora);
    if (!agora.ok) return agora;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.tokensRepo.buscarPorId({
        locatarioId: locatarioId.value,
        usuarioId: usuarioId.value,
        tokenId: tokenId.value,
      });
      if (!atual.ok) return atual;

      if (!atual.value) {
        return tokenNaoEncontrado(tokenId.value);
      }

      const agora = deps.relogio.agora();
      const statusAtual = obterStatusToken(atual.value, agora);

      const transicao = transicionarEstadoToken({
        tokenId: atual.value.tokenId,
        statusAtual,
        evento: "REVOGAR",
      });
      if (!transicao.ok) return transicao;

      const atualizado = await deps.tokensRepo.atualizar({
        ...atual.value,
        revogadoEm: agora,
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk<RevogarTokenOutput>({
        token: atualizado.value,
      });
    });
  };
}
