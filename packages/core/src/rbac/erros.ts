// packages/core/src/rbac/erros.ts

import { createErroApp } from "../kernel";
import { Permissao } from "./tipos";

export type CodigoErroRbac =
  | "RBAC_PERMISSAO_INVALIDA"
  | "RBAC_NAO_AUTENTICADO"
  | "RBAC_NAO_AUTORIZADO"

/**
 * Cria erro para permissão inválida no contexto de RBAC.
 *
 * Use este helper quando uma permissão informada não pertence ao catálogo
 * canônico do sistema ou não pode ser processada pelo módulo.
 *
 * @param permissao Permissão rejeitada pelo módulo.
 * @returns `Err(ErroApp)` específico do domínio de autorização.
 */
export function permissaoInvalida(permissao: Permissao) {
  return createErroApp({ codigo: "RBAC_PERMISSAO_INVALIDA", mensagem: "Permissão inválida.", detalhes: { permissao } });
}

/**
 * Cria erro quando a resolução de autorização é tentada sem usuário autenticado.
 *
 * @returns `Err(ErroApp)` específico do módulo RBAC.
 */
export function naoAutenticado() {
  return createErroApp({ codigo: "RBAC_NAO_AUTENTICADO", mensagem: "Usuário não autenticado para resolução de autorização.", detalhes: {} });
}

/**
 * Cria erro quando o usuário não possui a permissão exigida.
 *
 * @param permissao Permissão necessária para a operação.
 * @returns `Err(ErroApp)` com a permissão faltante em `detalhes`.
 */
export function naoAutorizado(permissao: Permissao) {
  return createErroApp({ codigo: "RBAC_NAO_AUTORIZADO", mensagem: "Usuário não possui a permissão necessária.", detalhes: { permissao } });
}
