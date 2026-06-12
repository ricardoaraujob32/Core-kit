// packages/core/src/assinaturas/usecases/helpers.ts

import { wrapOk } from "../../kernel/index.js";
import { erroAssinaturaNaoEncontrada } from "../erros.js";
import type { AssinaturasRepositorio } from "../portasRepositorio.js";
import type { AssinaturaId } from "../tipos.js";
import { validarAtivarAssinaturaInput } from "../validadores.js";

/**
 * 
 * @param params 
 * @returns 
 */
export async function obterAssinaturaObrigatoria(params: {
  assinaturasRepositorio: AssinaturasRepositorio;
  assinaturaId: AssinaturaId;
}) {
  const validacao = validarAtivarAssinaturaInput({
    assinaturaId: params.assinaturaId,
  });

  if (!validacao.ok) return validacao;

  const assinatura = await params.assinaturasRepositorio.buscarPorId(
    validacao.value.assinaturaId,
  );

  if (!assinatura.ok) return assinatura;

  if (!assinatura.value) {
    return erroAssinaturaNaoEncontrada(validacao.value.assinaturaId);
  }

  return wrapOk(assinatura.value);
}