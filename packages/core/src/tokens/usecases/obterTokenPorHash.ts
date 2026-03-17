// packages/core/src/tokens/usecases/obterTokenPorHash.ts

import { wrapOk } from "../../result";
import type { ObterTokenPorHashInput, ResultadoObterTokenPorHash } from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { validarHashToken } from "../validadores";
import { tokenExpirado, tokenNaoEncontrado, tokenRevogado } from "../erros";

export function createObterTokenPorHash(deps: {
  tokensRepo: TokensRepositorio;
  agora: () => Date;
}) {
  return async function obterTokenPorHash(input: ObterTokenPorHashInput): ResultadoObterTokenPorHash {
    const hashToken = validarHashToken(input.hashToken);
    if (!hashToken.ok) return hashToken;

    const res = await deps.tokensRepo.buscarPorHash({
      hashToken: hashToken.value,
    });
    if (!res.ok) return res;

    const token = res.value;
    if (!token) return tokenNaoEncontrado(hashToken.value);

    if (token.revogadoEm) {
      return tokenRevogado(token.tokenId);
    }

    if (token.expiraEm.getTime() <= deps.agora().getTime()) {
      return tokenExpirado(token.tokenId);
    }

    return wrapOk(token);
  };
}