// packages/core/src/tokens/usecases/obterTokenPorHash.ts

import { RelogioPorta, wrapOk } from "../../kernel";
import type { ObterTokenPorHashInput, ObterTokenPorHashOutput, ObterTokenPorHashResult } from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { validarHashToken } from "../validadores";
import { tokenExpirado, tokenNaoEncontrado, tokenRevogado } from "../erros";
import { validarLocatarioId } from "../../locatarios";
import { validarUsuarioId } from "../../usuarios";

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
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const hashToken = validarHashToken(input.hashToken);
    if (!hashToken.ok) return hashToken;

    const res = await deps.tokensRepo.buscarPorHash({
      locatarioId: locatarioId.value,
      usuarioId: usuarioId.value,
      hashToken: hashToken.value,
    });
    if (!res.ok) return res;

    const token = res.value;
    if (!token) return tokenNaoEncontrado(hashToken.value);

    if (token.revogadoEm) {
      return tokenRevogado(token.tokenId);
    }

    if (token.expiraEm.getTime() <= deps.relogio.agora().getTime()) {
      return tokenExpirado(token.tokenId);
    }

    return wrapOk<ObterTokenPorHashOutput>({
      token,
    });
  };
}
