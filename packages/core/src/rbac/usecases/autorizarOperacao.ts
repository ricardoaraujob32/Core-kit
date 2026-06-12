// packages/core/src/rbac/usecases/autorizarOperacao.ts

import { normalizarPermissoes, wrapOk } from "../../kernel";
import type { AutorizarOperacaoInput, Permissao, AutorizarOperacaoResult } from "../tipos";
import { naoAutenticado, naoAutorizado } from "../erros";
import { validarPermissao } from "../validadores";

/**
 * Autoriza uma operação a partir do contexto corrente e da permissão exigida.
 *
 * Este caso de uso:
 * - valida a permissão requerida;
 * - exige que exista usuário autenticado no contexto;
 * - normaliza a coleção de permissões já presentes no contexto;
 * - verifica se a permissão exigida está incluída;
 * - falha com erro específico de RBAC quando a permissão não estiver disponível.
 *
 * Observação:
 * esta função não resolve permissões no repositório. Ela apenas decide a
 * autorização com base no contexto já enriquecido ou previamente preparado.
 *
 * @param input Contexto de execução e permissão requerida para a operação.
 * @returns `Ok(void)` quando a operação é autorizada, ou `Err(ErroApp)` quando negada.
 */
export function autorizarOperacao(input: AutorizarOperacaoInput): AutorizarOperacaoResult {
  const permissaoValida = validarPermissao(input.permissao);
  if (!permissaoValida.ok) return permissaoValida;

  if (!input.ctx.usuarioId) {
    return naoAutenticado();
  }

  const permissao: Permissao = input.permissao;
  const permissoes = normalizarPermissoes(input.ctx);

  if (!permissoes.includes(permissao)) {
    return naoAutorizado(permissao);
  }

  return wrapOk(undefined);
}
