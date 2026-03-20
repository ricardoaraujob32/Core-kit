// packages/core/src/tokens/usecases/rotacionarToken.ts

import type { IdPorta, RelogioPorta } from "../../kernel";
import { tokenInvalido, tokenNaoEncontrado, tokenRevogado, hashTokenJaExiste } from "../erros";
import type { ResultadoRotacionarToken, RotacionarTokenInput } from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { validarExpiraEm, validarHashToken, validarTokenId } from "../validadores";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnRotacionarToken(deps: {
  tokensRepo: TokensRepositorio;
  idPorta: IdPorta;
  relogio: RelogioPorta;
}) {
  return async function rotacionarToken(input: RotacionarTokenInput): ResultadoRotacionarToken {
    const tokenId = validarTokenId(input.tokenId);
    if (!tokenId.ok) return tokenId;

    const novoHashToken = validarHashToken(input.novoHashToken);
    if (!novoHashToken.ok) return novoHashToken;

    const novoExpiraEm = validarExpiraEm(input.novoExpiraEm);
    if (!novoExpiraEm.ok) return novoExpiraEm;

    const agora = deps.relogio.agora();

    if (novoExpiraEm.value.getTime() <= agora.getTime()) {
      return tokenInvalido({ campo: "novoExpiraEm", regra: "deve_ser_futuro" });
    }

    const atual = await deps.tokensRepo.buscarPorId({
      tokenId: tokenId.value,
    });
    if (!atual.ok) return atual;
    if (!atual.value) return tokenNaoEncontrado(tokenId.value);
    if (atual.value.revogadoEm) return tokenRevogado(tokenId.value);

    const existente = await deps.tokensRepo.buscarPorHash({
      hashToken: novoHashToken.value,
    });
    if (!existente.ok) return existente;
    if (existente.value) return hashTokenJaExiste(novoHashToken.value);

    const novoTokenId = deps.idPorta.gerarId();

    const tokenAnterior = await deps.tokensRepo.atualizar({
      ...atual.value,
      revogadoEm: agora,
      proximoTokenId: novoTokenId,
    });
    if (!tokenAnterior.ok) return tokenAnterior;

    const tokenNovoCriado = await deps.tokensRepo.criar({
      tokenId: novoTokenId,
      usuarioId: atual.value.usuarioId,
      locatarioId: atual.value.locatarioId,
      hashToken: novoHashToken.value,
      tipo: atual.value.tipo,
      emitidoEm: agora,
      expiraEm: novoExpiraEm.value,
      revogadoEm: null,
      proximoTokenId: null,
      agenteUsuario: input.agenteUsuario ?? atual.value.agenteUsuario,
      enderecoIp: input.enderecoIp ?? atual.value.enderecoIp,
    });
    if (!tokenNovoCriado.ok) return tokenNovoCriado;

    const tokenNovo = await deps.tokensRepo.buscarPorId({
      tokenId: tokenNovoCriado.value.tokenId,
    });
    if (!tokenNovo.ok) return tokenNovo;
    if (!tokenNovo.value) return tokenNaoEncontrado(tokenNovoCriado.value.tokenId);

    return {
      ok: true,
      value: {
        tokenAnterior: tokenAnterior.value,
        tokenNovo: tokenNovo.value,
      },
    };
  };
}
