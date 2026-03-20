// packages/core/src/tokens/usecases/revogarToken.ts

import type { RelogioPorta } from "../../kernel";
import type { RevogarTokenInput, ResultadoRevogarToken } from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { validarTokenId } from "../validadores";
import { tokenNaoEncontrado, tokenRevogado } from "../erros";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnRevogarToken(deps: {
  tokensRepo: TokensRepositorio;
  relogio: RelogioPorta;
}) {
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
