// packages/core/src/tokens/usecases/helpers.ts

import { wrapOk } from "../../kernel/index.js";
import { validarLocatarioId } from "../../locatarios/index.js";
import { validarUsuarioId } from "../../usuarios/index.js";
import { tokenNaoEncontrado } from "../erros.js";
import type { TokensRepositorio } from "../portasRepositorio.js";
import type { TokenId } from "../tipos.js";
import { validarHashToken, validarTokenId } from "../validadores.js";

export async function obterTokenObrigatorioPorId(params: {
  tokensRepo: TokensRepositorio;
  locatarioId: string;
  usuarioId: string;
  tokenId: TokenId;
}) {
  const locatarioId = validarLocatarioId(params.locatarioId);
  if (!locatarioId.ok) return locatarioId;

  const usuarioId = validarUsuarioId(params.usuarioId);
  if (!usuarioId.ok) return usuarioId;

  const tokenId = validarTokenId(params.tokenId);
  if (!tokenId.ok) return tokenId;

  const resultado = await params.tokensRepo.buscarPorId({
    locatarioId: locatarioId.value,
    usuarioId: usuarioId.value,
    tokenId: tokenId.value,
  });
  if (!resultado.ok) return resultado;

  if (!resultado.value) {
    return tokenNaoEncontrado(tokenId.value);
  }

  return wrapOk(resultado.value);
}

export async function obterTokenObrigatorioPorHash(params: {
  tokensRepo: TokensRepositorio;
  locatarioId: string;
  usuarioId: string;
  hashToken: string;
}) {
  const locatarioId = validarLocatarioId(params.locatarioId);
  if (!locatarioId.ok) return locatarioId;

  const usuarioId = validarUsuarioId(params.usuarioId);
  if (!usuarioId.ok) return usuarioId;

  const hashToken = validarHashToken(params.hashToken);
  if (!hashToken.ok) return hashToken;

  const resultado = await params.tokensRepo.buscarPorHash({
    locatarioId: locatarioId.value,
    usuarioId: usuarioId.value,
    hashToken: hashToken.value,
  });
  if (!resultado.ok) return resultado;

  if (!resultado.value) {
    return tokenNaoEncontrado(hashToken.value);
  }

  return wrapOk(resultado.value);
}