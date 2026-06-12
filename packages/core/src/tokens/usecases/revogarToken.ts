// packages/core/src/tokens/usecases/revogarToken.ts

import { executarEmTransacao, wrapOk, type RelogioPorta, type TransacaoPorta } from "../../kernel/index.js";
import type { RevogarTokenInput, RevogarTokenOutput, RevogarTokenResult } from "../tipos.js";
import type { TokensRepositorio } from "../portasRepositorio.js";
import { validarAgora } from "../validadores.js";
import { exigirTransicaoToken } from "../maquinaEstados.js";
import { autorizarToken, PoliticaSegurancaTokensPorta } from "../politicas.js";
import { obterTokenObrigatorioPorId } from "./helpers.js";

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
  politicaSeguranca?: PoliticaSegurancaTokensPorta;
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
    const agoraInput = validarAgora(input.agora);
    if (!agoraInput.ok) return agoraInput;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await obterTokenObrigatorioPorId({
        tokensRepo: deps.tokensRepo,
        locatarioId: input.locatarioId,
        usuarioId: input.usuarioId,
        tokenId: input.tokenId,
      });
      if (!atual.ok) return atual;

      const autorizacao = await autorizarToken(deps, {
        operacao: "TOKEN_REVOGAR",
        locatarioId: atual.value.locatarioId,
        usuarioId: atual.value.usuarioId,
        tokenId: atual.value.tokenId,
        token: atual.value,
        dados: {
          motivo: input.motivo,
        },
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const agora = deps.relogio.agora();

      const transicao = exigirTransicaoToken({
        token: atual.value,
        agora,
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
