// packages/core/src/usuarios/erros.ts

import { LocatarioId } from "../locatarios";
import { createErroApp } from "../kernel";
import { UsuarioId } from "./tipos";

/**
 * Cria erro para entradas inválidas do domínio de usuários.
 *
 * Use este helper para validar payloads, filtros e comandos relacionados a
 * cadastro, atualização, ativação ou consulta de usuários.
 *
 * @param detalhes Metadados estruturados sobre a invalidez encontrada.
 * @returns `Err(ErroApp)` com código específico do módulo.
 */
export function usuarioInvalido(detalhes?: Record<string, unknown>) {
  return createErroApp({ codigo: "USUARIO_INVALIDO", detalhes });
}

/**
 * Cria erro quando o usuário solicitado não existe.
 *
 * @param usuarioId Identificador do usuário não encontrado.
 * @returns `Err(ErroApp)` tipado para ausência de usuário.
 */
export function usuarioNaoEncontrado(usuarioId: UsuarioId) {
  return createErroApp({ codigo: "USUARIO_NAO_ENCONTRADO", detalhes: { usuarioId } });
}

/**
 * Cria erro para usuário inativo.
 *
 * @param usuarioId Identificador do usuário inativo.
 * @returns `Err(ErroApp)` com o estado incompatível da conta.
 */
export function usuarioInativo(usuarioId: UsuarioId) {
  return createErroApp({ codigo: "USUARIO_INATIVO", detalhes: { usuarioId } });
}

/**
 * Cria erro para usuário suspenso.
 *
 * @param usuarioId Identificador do usuário suspenso.
 * @returns `Err(ErroApp)` com contexto sobre o usuário bloqueado.
 */
export function usuarioSuspenso(usuarioId: UsuarioId) {
  return createErroApp({ codigo: "USUARIO_SUSPENSO", detalhes: { usuarioId } });
}

/**
 * Cria erro para usuário encerrado.
 *
 * @param usuarioId Identificador do usuário encerrado.
 * @returns `Err(ErroApp)` com contexto sobre o usuário encerrado.
 */
export function usuarioEncerrado(usuarioId: UsuarioId) {
  return createErroApp({ codigo: "USUARIO_ENCERRADO", detalhes: { usuarioId } });
}

/**
 * Cria erro de conflito para e-mail já existente no escopo informado.
 *
 * O escopo pode ser um locatário específico ou outro domínio previsto pela
 * regra de unicidade adotada pela aplicação.
 *
 * @param email E-mail cuja unicidade foi violada.
 * @param locatarioId Locatário no qual o conflito foi detectado, quando aplicável.
 * @returns `Err(ErroApp)` de conflito de cadastro.
 */
export function emailUsuarioJaExiste(email: string, locatarioId: LocatarioId | null) {
  return createErroApp({ codigo: "USUARIO_EMAIL_JA_EXISTE", detalhes: { email, locatarioId } });
}

/**
 * 
 * @param usuarioId 
 * @returns 
 */
export function senhaAtualInvalida(usuarioId: UsuarioId) {
  return createErroApp({
    codigo: "NAO_AUTENTICADO",
    mensagem: "Senha atual inválida.",
    detalhes: { usuarioId },
  });
}
