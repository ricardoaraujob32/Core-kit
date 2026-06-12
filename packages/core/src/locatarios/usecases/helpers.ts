// packages/core/src/locatarios/usecases/helpers.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import { validarLocatarioId } from "../validadores";
import { locatarioInvalido, locatarioNaoEncontrado } from "../erros";
import type { ConfiguracaoLocatarioId, Locatario, LocatarioId } from "../tipos";
import { wrapOk } from "../../kernel";

/**
 * 
 * @param params 
 * @returns 
 */
export async function obterLocatarioObrigatorio(params: { locatariosRepositorio: LocatariosRepositorio; locatarioId: LocatarioId; }) {
  const locatarioId = validarLocatarioId(params.locatarioId);
  if (!locatarioId.ok) return locatarioId;

  const resultado = await params.locatariosRepositorio.buscarPorId({
    locatarioId: locatarioId.value,
  });
  if (!resultado.ok) return resultado;

  if (!resultado.value) {
    return locatarioNaoEncontrado(locatarioId.value);
  }

  return wrapOk(resultado.value);
}

/**
 * 
 * @param params 
 * @returns 
 */
export function obterConfiguracaoObrigatoria(params: { locatario: Locatario; configuracaoId: ConfiguracaoLocatarioId; }) {
  const configuracao = params.locatario.configuracoes.find(
    (item) => item.configuracaoId === params.configuracaoId,
  );

  if (!configuracao) {
    return locatarioInvalido({
      campo: "configuracaoId",
      valor: params.configuracaoId,
      motivo: "configuracao_nao_encontrada",
    });
  }

  return wrapOk(configuracao);
}
