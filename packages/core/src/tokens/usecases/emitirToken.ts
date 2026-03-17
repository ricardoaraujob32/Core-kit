// packages/core/src/tokens/usecases/emitirToken.ts

import { wrapOk } from "../../result";
import type { IdPorta, RelogioPorta } from "../../utils";
import type { EmitirTokenInput, EmitirTokenOutput, ResultadoEmitirToken } from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { validarHashToken, validarExpiraEm, validarTokenTipo } from "../validadores";
import { hashTokenJaExiste, tokenInvalido } from "../erros";
import { validarLocatarioId } from "../../locatarios";
import { validarUsuarioId } from "../../usuarios";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createEmitirToken(deps: {
  tokensRepo: TokensRepositorio;
  idPorta: IdPorta;
  relogio: RelogioPorta;
}) {
  return async function emitirToken(input: EmitirTokenInput): ResultadoEmitirToken {
    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const hashToken = validarHashToken(input.hashToken);
    if (!hashToken.ok) return hashToken;

    const tipo = validarTokenTipo(input.tipo);
    if (!tipo.ok) return tipo;

    const expiraEm = validarExpiraEm(input.expiraEm);
    if (!expiraEm.ok) return expiraEm;

    const agora = deps.relogio.agora();
    if (expiraEm.value.getTime() <= agora.getTime()) {
      return tokenInvalido({ campo: "expiraEm", regra: "deve_ser_futuro" });
    }

    const existente = await deps.tokensRepo.buscarPorHash({
      hashToken: hashToken.value,
    });
    if (!existente.ok) return existente;
    if (existente.value) return hashTokenJaExiste(hashToken.value);

    const tokenId = deps.idPorta.gerarId();

    const criado = await deps.tokensRepo.criar({
      tokenId,
      usuarioId: usuarioId.value,
      locatarioId: locatarioId.value,
      hashToken: hashToken.value,
      tipo: tipo.value,
      emitidoEm: agora,
      expiraEm: expiraEm.value,
      revogadoEm: null,
      proximoTokenId: null,
      agenteUsuario: input.agenteUsuario ?? null,
      enderecoIp: input.enderecoIp ?? null,
    });
    if (!criado.ok) return criado;

    return wrapOk<EmitirTokenOutput>({
      tokenId: criado.value.tokenId,
    });
  };
}