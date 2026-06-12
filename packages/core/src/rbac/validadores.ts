// packages/core/src/rbac/validadores.ts

import { ErroApp, Result, validarTextoObrigatorio } from "../kernel/index.js";
import { permissaoInvalida } from "./erros.js";
import { Permissao } from "./tipos.js";

/**
 * Valida uma permissão textual no contexto de RBAC.
 *
 * No estado atual, a validação garante apenas que o valor:
 * - seja textual;
 * - não seja vazio após `trim`.
 *
 * A validação de pertencimento ao catálogo canônico pode ser acrescentada
 * futuramente sem alterar a assinatura pública da função.
 *
 * @param permissao Permissão recebida para validação.
 * @returns `Ok(permissaoNormalizada)` quando o valor atende ao mínimo esperado.
 */
export function validarPermissao(permissao: Permissao): Result<string, ErroApp> {
  const res = validarTextoObrigatorio(permissao, "permissao", 1);
  if (res.ok) return res;

  return permissaoInvalida(permissao);
}
